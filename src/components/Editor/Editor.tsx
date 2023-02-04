import {
  useState,
  MouseEvent,
  KeyboardEvent,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from 'react';
import bitmaskToPath from '@pictogrammers/bitmask-to-svg';
import './Editor.css';

const defaultPath = 'M20,30H30V20H20ZM20,60H10V10H40V40H20Z';
const guides = [
  {
    name: 'Circle Outer',
    width: 22,
    height: 22,
    color: '#F00',
    opacity: 0.25,
    lines: [
      [7, 1],
      [15, 1],
      [15, 2],
      [17, 2],
      [17, 3],
      [18, 3],
      [18, 4],
      [19, 4],
      [19, 5],
      [20, 5],
      [20, 7],
      [21, 7],
      [21, 15],
      [20, 15],
      [20, 17],
      [19, 17],
      [19, 18],
      [18, 18],
      [18, 19],
      [17, 19],
      [17, 20],
      [15, 20],
      [15, 21],
      [7, 21],
      [7, 20],
      [5, 20],
      [5, 19],
      [4, 19],
      [4, 18],
      [3, 18],
      [3, 17],
      [2, 17],
      [2, 15],
      [1, 15],
      [1, 7],
      [2, 7],
      [2, 5],
      [3, 5],
      [3, 4],
      [4, 4],
      [4, 3],
      [5, 3],
      [5, 2],
      [7, 2],
      [7, 1]
    ]
  },
  {
    name: 'Circle Inner',
    width: 22,
    height: 22,
    color: '#00F',
    opacity: 0.25,
    lines: [
      [8, 3],
      [14, 3],
      [14, 4],
      [16, 4],
      [16, 5],
      [17, 5],
      [17, 6],
      [18, 6],
      [18, 8],
      [19, 8],
      [19, 14],
      [18, 14],
      [18, 16],
      [17, 16],
      [17, 17],
      [16, 17],
      [16, 18],
      [14, 18],
      [14, 19],
      [8, 19],
      [8, 18],
      [6, 18],
      [6, 17],
      [5, 17],
      [5, 16],
      [4, 16],
      [4, 14],
      [3, 14],
      [3, 8],
      [4, 8],
      [4, 6],
      [5, 6],
      [5, 5],
      [6, 5],
      [6, 4],
      [8, 4],
      [8, 3]
    ]
  },
  {
    name: 'Square',
    width: 22,
    height: 22,
    color: '#0F0',
    opacity: 0.4,
    lines: [
      [2, 2],
      [20, 2],
      [20, 20],
      [2, 20],
      [2, 2]
    ]
  }
];

function fillArray(width: number, height: number) {
  let arr = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(0);
    }
    arr.push(row);
  }
  return arr;
}

function iterate(data: number[][], callback: (color: number, x: number, y: number) => void) {
  for (let iy = 0; iy < data.length; iy++) {
    for (let ix = 0; ix < data[0].length; ix++) {
      callback(data[iy][ix], ix, iy);
    }
  }
}

/**
 * Copy array to new array instance.
 *
 * @param data 2d
 */
function clone(data: number[][]) {
  const newData: number[][] = [];
  for (let iy = 0; iy < data.length; iy++) {
    newData.push([]);
    for (let ix = 0; ix < data[0].length; ix++) {
      newData[iy].push(data[iy][ix]);
    }
  }
  return newData;
}

/**
 * Get a difference between 2d arrays.
 *
 * @param oldData Before the change.
 * @param newData After the change.
 * @returns list of changes [[x, y, color], ...]
 */
function diff(oldData: number[][], newData: number[][]): number[][] {
  const changes = [];
  // Loop the larger grid
  const oldWidth = oldData[0].length;
  const oldHeight = oldData.length;
  const newWidth = newData[0].length;
  const newHeight = newData.length;
  const width = Math.max(oldWidth, newWidth);
  const height = Math.max(oldHeight, newHeight);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const newColor = newData && newData[y] && newData[y][x];
      const oldColor = oldData && oldData[y] && oldData[y][x];
      if (newColor === oldColor) { continue; }
      changes.push([x, y, oldColor, newColor]);
    }
  }
  return changes;
}

const useCanvas = (callback: (args: [HTMLCanvasElement, CanvasRenderingContext2D]) => void) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
    callback([canvas, ctx]);
  }, [callback]);

  return canvasRef;
}

let timer: NodeJS.Timeout;;
function debounce(func: Function, timeout = 300) {
  clearTimeout(timer);
  timer = setTimeout(() => { func(); }, timeout);
}

let previous = fillArray(2, 2);

interface EditorProps {
  width?: number;
  height?: number;
  size?: number;
  onChange?: (path: string) => void;
  onChangeData?: (data: number[][]) => void;
}
export type EditorRef = {
  clear: () => void,
  clearHistory: () => void,
  applyTemplate: (data: number[][]) => void,
  flipHorizontal: () => void,
  flipVertical: () => void,
  translate: (x: number, y: number) => void,
  rotate: (counterClockwise?: boolean) => void,
  undo: () => void,
  redo: () => void,
  hasUndo: () => boolean,
  hasRedo: () => boolean
};

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    clear: () => {
      for (let iy = 0; iy < height; iy++) {
        data[iy].fill(0);
      }
      update();
    },
    clearHistory: () => {

    },
    applyTemplate: (template: number[][]) => {
      for (let iy = 0; iy < height; iy++) {
        for (let ix = 0; ix < width; ix++) {
          if (template[iy][ix] === 0) { continue; }
          data[iy][ix] = template[iy][ix];
        }
      }
      update();
    },
    flipHorizontal: () => {
      const cloned = clone(data);
      const w = cloned[0].length - 1;
      iterate(cloned, (color, x, y) => {
        data[y][x] = cloned[y][w - x];
      });
      update();
    },
    flipVertical: () => {
      const cloned = clone(data);
      const h = cloned.length - 1;
      iterate(cloned, (color, x, y) => {
        data[y][x] = cloned[h - y][x];
      });
      update();
    },
    translate: (translateX: number, translateY: number) => {
      const cloned = clone(data);
      const h = cloned.length;
      const w = cloned[0].length;
      for (let iy = 0; iy < height; iy++) {
        data[iy].fill(0);
      }
      iterate(cloned, (color, x, y) => {
        if (y - translateY < 0
          || x - translateX < 0
          || y - translateY >= h
          || x - translateX >= w) {
          return;
        }
        data[y][x] = cloned[y - translateY][x - translateX];
      });
      update();
    },
    undo: () => {
      const revert = history.pop();
      if (!revert) { return; }
      setHistory(history);
      redoHistory.push(revert);
      setRedoHistory(redoHistory);
      revert?.forEach((item) => {
        const [x, y] = item;
        data[y][x] = item[2];
        previous = clone(data);
        setData(data);
        if (context) {
          redraw(context);
        }
      });
    },
    redo: () => {
      const revert = redoHistory.pop();
      if (!revert) { return; }
      history.push(revert);
      setHistory(history);
      setRedoHistory(redoHistory);
      revert?.forEach((item) => {
        const [x, y] = item;
        data[y][x] = item[3];
        previous = clone(data);
        setData(data);
        if (context) {
          redraw(context);
        }
      });
    },
    rotate: (counterClockwise: boolean = false) => {
      if (counterClockwise) {
        const newData = data[0].map((val, index) => data.map(row => row[row.length - 1 - index]));
        for (let iy = 0; iy < height; iy++) {
          for (let ix = 0; ix < width; ix++) {
            data[iy][ix] = newData[iy][ix];
          }
        }
      } else {
        const newData = data[0].map((val, index) => data.map(row => row[index]).reverse());
        for (let iy = 0; iy < height; iy++) {
          for (let ix = 0; ix < width; ix++) {
            data[iy][ix] = newData[iy][ix];
          }
        }
      }
      update();
    },
    hasUndo() {
      return history.length !== 0;
    },
    hasRedo() {
      return redoHistory.length !== 0;
    }
  }));
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [pressed, setPressed] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(props.width || 24);
  const [height, setHeight] = useState<number>(props.height || 24);
  const [size, setSize] = useState<number>(props.size || 10);
  const [path, setPath] = useState<string>(defaultPath);
  const [x, setX] = useState<number | null>(null);
  const [y, setY] = useState<number | null>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [startData, setStartData] = useState<number | null>(null);
  const defaultData = fillArray(width, height);
  const [data, setData] = useState<number[][]>(defaultData);
  const [actualWidth, setActualWidth] = useState<number>(width * size);
  const [actualHeight, setActualHeight] = useState<number>(height * size);
  const [history, setHistory] = useState<number[][][]>([]);
  const [redoHistory, setRedoHistory] = useState<number[][][]>([]);

  useEffect(() => {
    setSize(props.size || 10);
  }, [props.size]);

  useEffect(() => {
    console.log('new width', props.width);
    setWidth(props.width || 22);
  }, [props.width]);

  useEffect(() => {
    console.log('new height', props.height);
    setHeight(props.height || 22);
  }, [props.height]);

  useEffect(() => {
    // Resize Data array
    const w = (props.width || 22) - width;
    const h = (props.height || 22) - height;
    console.log(w, h);
    if (w > 0) {
      data.forEach(row => {
        for (let i = 0; i < w; i++) {
          row.push(0);
        }
      });
    } else if (w < 0) {
      data.forEach(row => {
        for (let i = 0; i < Math.abs(w); i++) {
          row.pop();
        }
      });
    }
    if (h > 0) {
      for (let i = 0; i < h; i++) {
        data.push(Array(props.width).fill(0));
      }
    } else if (h < 0) {
      for (let i = 0; i < Math.abs(h); i++) {
        data.pop();
      }
    }
    console.log(data.length, data[0].length);
    previous = clone(data);
    setData(data);
    // Set Width Height of canvas
    setActualWidth((props.width || 22) * (props.size || 10));
    setActualHeight((props.height || 22) * (props.size || 10));
  }, [data, height, width, props.size, props.width, props.height]);

  const canvasRef = useCanvas(([canvasInit, contextInit]) => {
    setCanvas(canvasInit);
    setContext(contextInit);
    console.log(width, height, '----------')
    redraw(contextInit);
  });

  function handleMouseDown(event: MouseEvent) {
    if (!canvas) { return; }
    const rect = canvas.getBoundingClientRect();
    let newX = Math.floor((event.clientX - rect.left) / size);
    let newY = Math.floor((event.clientY - rect.top) / size);
    if (newX === x && newY === y) { return; }
    if (newX >= width) { newX = width - 1; }
    if (newY >= height) { newY = height - 1; }
    setX(newX);
    setY(newY);
    setStartX(newX);
    setStartY(newY);
    setStartData(data[newY][newX]);
    const needsToupdate = data[newY][newX] !== (event.buttons === 32 ? 0 : 1);
    data[newY][newX] = event.buttons === 32 ? 0 : 1;
    setData(data);
    setPressed(true);
    if (needsToupdate) {
      update();
    }
  }

  function handleMouseUp(event: MouseEvent) {
    if (!canvas) { return; }
    const rect = canvas.getBoundingClientRect();
    let newX = Math.floor((event.clientX - rect.left) / size);
    let newY = Math.floor((event.clientY - rect.top) / size);
    if (newX >= width) { newX = width - 1; }
    if (newY >= height) { newY = height - 1; }
    if (newX === startX && newY === startY && startData === 1) {
      data[newY][newX] = 0;
      setData(data);
      update();
    }
    setX(null);
    setY(null);
    setPressed(false);
  }

  function handleMouseMove(event: MouseEvent) {
    if (!canvas) { return; }
    if (pressed) {
      const rect = canvas.getBoundingClientRect();
      let newX = Math.floor((event.clientX - rect.left) / size);
      let newY = Math.floor((event.clientY - rect.top) / size);
      if (newX === x && newY === y) { return; }
      if (newX >= width) { newX = width - 1; }
      if (newY >= height) { newY = height - 1; }
      setX(newX);
      setY(newY);
      data[newY][newX] = event.buttons === 32 ? 0 : 1;
      setData(data);
      update();
    }
  }

  function handlePointerEnter(event: MouseEvent) {

  }

  function handlePointerLeave(event: MouseEvent) {

  }

  function redraw(ctx: CanvasRenderingContext2D) {
    // Clear
    ctx.clearRect(0, 0, actualWidth, actualHeight);
    // Grid
    ctx.fillStyle = '#DDDDDD';
    for (let ix = 1; ix < width; ix++) {
      ctx.fillRect(ix * size, 0, 1, height * size);
    }
    for (let iy = 1; iy < height; iy++) {
      ctx.fillRect(0, iy * size, width * size, 1);
    }
    // Guides
    guides.forEach(guide => {
      if (guide.width !== width || guide.height !== height) {
        return;
      }
      ctx.globalAlpha = guide.opacity;
      ctx.strokeStyle = guide.color;
      ctx.lineWidth = 1;
      ctx.fillStyle = 'transparent';
      ctx.beginPath();
      guide.lines.forEach((coordinates, i) => {
        if (i === 0) {
          ctx.moveTo(coordinates[0] * size + 0.5, coordinates[1] * size + 0.5);
        } else {
          ctx.lineTo(coordinates[0] * size + 0.5, coordinates[1] * size + 0.5);
        }
      });
      ctx.stroke();
    });
    ctx.globalAlpha = 1.0;
    // Icon
    for (let iy = 0; iy < height; iy++) {
      for (let ix = 0; ix < width; ix++) {
        if (data[iy][ix]) {
          ctx.fillStyle = '#333333';
          ctx.fillRect(ix * size, iy * size, size, size);
          ctx.fillStyle = '#000000';
          ctx.fillRect(ix * size, iy * size, size - 1, size - 1);
        }
      }
    }
    const path = bitmaskToPath(data, { scale: 1 });
    if (props.onChange) {
      props.onChange(path);
    }
    if (props.onChangeData) {
      props.onChangeData(data);
    }
  }

  function update() {
    if (!context) { return; }
    // Store Diff History
    debounce(() => {
      const changes = diff(previous, data);
      if (changes.length === 0) { return; }
      history.push(changes);
      setHistory(history);
      setRedoHistory([]);
      previous = clone(data);
    }, 1000);
    // Redraw the canvas
    redraw(context);
  }

  function handleKeyDown(event: KeyboardEvent) {

  }

  return (
    <canvas ref={canvasRef}
      tabIndex={0}
      width={actualWidth}
      height={actualHeight}
      onPointerDown={handleMouseDown}
      onPointerUp={handleMouseUp}
      onPointerMove={handleMouseMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      onKeyDown={handleKeyDown}
      draggable="false"></canvas>
  );
});

export default Editor;
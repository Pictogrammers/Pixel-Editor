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
import diffGrid from './utils/diffGrid';
import cloneGrid from './utils/cloneGrid';
import getGuides from './utils/getGuides';
import fillGrid from './utils/fillGrid';
import iterateGrid from './utils/interateGrid';
import debounce from './utils/debounce';
import { WHITE } from './utils/constants';
import isEmptyGrid from './utils/isEmptyGrid';

let previous = fillGrid(2, 2);
const defaultColors = ['transparent', '#000'];

type SetPixelFunction = (x: number, y: number, color: number) => void;
type SetGridFunction = (template: number[][], isEditing:boolean) => void;
type SetDataFunction = (template: number[][], x?: number, y?: number) => void;
type GetDataFunction = () => number[][];
type SetInputModeFunction = (mode: string) => void;

interface EditorProps {
  width?: number;
  height?: number;
  size?: number;
  colors?: string[];
  disableTransparency?: boolean;
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
  hasRedo: () => boolean,
  inputModePixel: () => void,
  inputModeLine: () => void,
  inputModeRectangle: () => void,
  inputModeEllipse: () => void
};

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  console.log('--render--');
  useImperativeHandle(ref, () => ({
    clear() {
      const clearedGrid = fillGrid(width, height);
      setData(clearedGrid);
      setGrid(clearedGrid, false);
    },
    clearHistory() {
      setHistory([]);
      setRedoHistory([]);
    },
    applyTemplate(template: number[][]) {
      setData(template);
      setGrid(template, false);
    },
    flipHorizontal() {
      const data = getData();
      const cloned = cloneGrid(data);
      const w = cloned[0].length - 1;
      iterateGrid(cloned, (x, y) => {
        data[y][x] = cloned[y][w - x];
      });
      setGrid(data, false);
    },
    flipVertical() {
      const data = getData();
      const cloned = cloneGrid(data);
      const h = cloned.length - 1;
      iterateGrid(cloned, (x, y) => {
        data[y][x] = cloned[h - y][x];
      });
      setGrid(data, false);
    },
    translate(translateX: number, translateY: number) {
      const data = getData();
      const cloned = cloneGrid(data);
      const h = cloned.length;
      const w = cloned[0].length;
      for (let iy = 0; iy < height; iy++) {
        data[iy].fill(0);
      }
      iterateGrid(cloned, (x, y) => {
        if (y - translateY < 0
          || x - translateX < 0
          || y - translateY >= h
          || x - translateX >= w) {
          return;
        }
        data[y][x] = cloned[y - translateY][x - translateX];
      });
      setGrid(data, false);
    },
    undo() {
      const revert = history.pop();
      if (!revert) { return; }
      setHistory(history);
      redoHistory.push(revert);
      setRedoHistory(redoHistory);
      const data = getData();
      revert?.forEach((item) => {
        const [x, y] = item;
        data[y][x] = item[2];
        previous = cloneGrid(data);
        setData(data);
        setGrid(data, false);
      });
    },
    redo() {
      const revert = redoHistory.pop();
      if (!revert) { return; }
      history.push(revert);
      setHistory(history);
      setRedoHistory(redoHistory);
      const data = getData();
      revert?.forEach((item) => {
        const [x, y] = item;
        data[y][x] = item[3];
        previous = cloneGrid(data);
        setData(data);
        setGrid(data, false);
      });
    },
    rotate(counterClockwise: boolean = false) {
      const data = getData();
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
      setData(data);
      setGrid(data, false);
    },
    hasUndo() {
      return history.length !== 0;
    },
    hasRedo() {
      return redoHistory.length !== 0;
    },
    inputModePixel() {

    },
    inputModeLine() {
        
    },
    inputModeRectangle() {
        
    },
    inputModeEllipse() {
        
    }
  }));

  const [width, setWidth] = useState<number>(props.width || 24);
  const [height, setHeight] = useState<number>(props.height || 24);
  const [size, setSize] = useState<number>(props.size || 10);
  const [gridSize, setGridSize] = useState<number>(1);
  const [colors, setColors] = useState<string[]>(props.colors || defaultColors);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const defaultData = fillGrid(width, height);
  //const [data, setData] = useState<number[][]>(defaultData);
  const [history, setHistory] = useState<number[][][]>([]);
  const [redoHistory, setRedoHistory] = useState<number[][][]>([]);
  const [setPixel, setSetPixel] = useState<SetPixelFunction>(() => () => console.log('ERROR'));
  const [setGrid, setSetGrid] = useState<SetGridFunction>(() => () => console.log('ERROR'));
  const [setData, setSetData] = useState<SetDataFunction>(() => () => console.log('ERROR'));
  const [getData, setGetData] = useState<GetDataFunction>(() => () => { console.log('ERROR'); return []; });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Init for width, height, size
  useEffect(() => {
    console.log('INIT', width, height, size);
    const data: number[][] = fillGrid(width, height);
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    const totalSize = size + gridSize;
    const actualWidth = width * totalSize - gridSize;
    const actualHeight = height * totalSize - gridSize;
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    const context = canvas.getContext('2d');
    const pixelGrid = document.createElement('canvas');
    pixelGrid.width = width * totalSize;
    pixelGrid.height = height * totalSize;
    const pixelGridContext = pixelGrid.getContext('2d');
    const guides = getGuides(width, height, size, gridSize);
    if (!context || !pixelGridContext) {
      return;
    }
    // setData
    setSetData(() => {
      return (template: number[][], offsetX: number = 0, offsetY: number = 0) => {
        let hasChanges = false;
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        iterateGrid(template, (x, y, color) => {
          if (data[y + offsetY][x + offsetX] !== color) {
            minX = Math.min(minX, x + offsetX);
            maxX = Math.max(maxX, x + offsetX);
            minY = Math.min(minY, y + offsetY);
            maxY = Math.max(maxY, y + offsetY);
            hasChanges = true;
            data[y + offsetY][x + offsetX] = color;
          }
        });
        if (hasChanges) {
          console.log('Region:', minX, maxX, minY, maxY);
        }
      };
    });
    // getData
    setGetData(() => {
      return () => {
        return data;
      }
    });
    // Init setGrid
    const tempSetGrid = (template: number[][], editing: boolean) => {
      // Clear
      context.clearRect(0, 0, actualWidth, actualHeight);
      // Guides
      context.drawImage(guides, 0, 0);
      context.globalAlpha = 1.0;
      // Icon
      const nWidth = Math.min(width, template[0].length);
      const nHeight = Math.min(height, template.length);
      for (let y = 0; y < nHeight; y++) {
        for (let x = 0; x < nWidth; x++) {
          const color = template[y][x];
          if (editing) {
            context.fillStyle = WHITE;
            context.fillRect(
              x * totalSize,
              y * totalSize,
              size,
              size
            );
            context.fillStyle = colors[color];
            context.fillRect(
              x * totalSize + gridSize,
              y * totalSize + gridSize,
              size - (gridSize * 2),
              size - (gridSize * 2)
            );
          } else {
            context.fillStyle = colors[color];
            context.fillRect(
              x * totalSize,
              y * totalSize,
              size,
              size
            );
          }
        }
      }
    };
    setSetGrid(() => {
      return tempSetGrid;
    });
    // Init setPixel
    setSetPixel(() => {
      return (x: number, y: number, color: number) => {
        pixelGridContext.fillStyle = '#FFF';
        pixelGridContext.fillRect(
          x * totalSize - (gridSize),
          y * totalSize - (gridSize),
          size + (gridSize * 2),
          size + (gridSize * 2)
        );
        // Update pixel grid
        if (!props.disableTransparency && colors[color] === 'transparent') {
          pixelGridContext.fillStyle = '#DDD';
          pixelGridContext.fillRect(x * totalSize + 1, y * totalSize + 1, size, size);
          pixelGridContext.fillStyle = WHITE;
          pixelGridContext.fillRect(x * totalSize + 1, y * totalSize + 1, 5, 5);
          pixelGridContext.fillRect(x * totalSize + 6, y * totalSize + 6, 5, 5);
        } else {
          pixelGridContext.fillStyle = colors[color] === 'transparent' ? WHITE : colors[color]
          pixelGridContext.fillRect(x * totalSize + 1, y * totalSize + 1, size - 2, size - 2);
        }
        // pixel grid to main canvas
        context.drawImage(
          pixelGrid,
          x * totalSize, y * totalSize, size + 2, size + 2,
          x * totalSize, y * totalSize, size + 2, size + 2
        );
        // grid to main canvas
        context.drawImage(
          guides,
          x * totalSize, y * totalSize, size + 2, size + 2,
          x * totalSize, y * totalSize, size + 2, size + 2
        );
        console.log(x, y, color, data[y][x - 1]);
      }
    });
    // Inital Rendering
    tempSetGrid(data, false);
  }, [width, height, size, gridSize]);

  useEffect(() => {
    const data = getData();
    setGrid(data, isEditing);
  }, [isEditing])

  useEffect(() => {
    console.log('new size', props.size);
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
    console.log('new colors', props.colors);
    setColors(props.colors || defaultColors);
  }, [props.colors]);

  /*useEffect(() => {
    // Resize Data array
    const w = (props.width || 22) - width;
    const h = (props.height || 22) - height;
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
    previous = cloneGrid(data);
    setData(data);
    // Set Width Height of canvas
    setActualWidth((props.width || 22) * (props.size || 10));
    setActualHeight((props.height || 22) * (props.size || 10));
  }, [data, height, width, props.size, props.width, props.height]);*/

  function handlePointerDown(event: MouseEvent) {
    if (event.buttons !== 1 && event.buttons !== 32) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const canvas = canvasRef.current;
    const data = getData();
    if (!canvas) { return; }
    const rect = canvas.getBoundingClientRect();
    const totalSize = size + gridSize;
    let newX = Math.floor((event.clientX - rect.left) / totalSize);
    let newY = Math.floor((event.clientY - rect.top) / totalSize);
    const x = parseInt(canvas.dataset.x || '-1', 10);
    const y = parseInt(canvas.dataset.y || '-1', 10);
    if (newX === x && newY === y) { return; }
    if (newX >= width) { newX = width - 1; }
    if (newY >= height) { newY = height - 1; }
    canvas.dataset.isPressed = 'true';
    canvas.dataset.startData = `${data[newY][newX]}`;
    canvas.dataset.startX = `${newX}`;
    canvas.dataset.startY = `${newY}`;
    canvas.dataset.x = `${newX}`;
    canvas.dataset.y = `${newY}`;
    const color = event.buttons === 32 ? 0 : 1;
    setPixel(newX, newY, color);
    data[newY][newX] = color;
    setData(data);
    console.log(newX, newY);
  }

  function handlePointerUp(event: MouseEvent) {
    const canvas = canvasRef.current;
    const data = getData();
    if (!canvas) { return; }
    const rect = canvas.getBoundingClientRect();
    const totalSize = size + gridSize;
    let newX = Math.floor((event.clientX - rect.left) / totalSize);
    let newY = Math.floor((event.clientY - rect.top) / totalSize);
    if (newX >= width) { newX = width - 1; }
    if (newY >= height) { newY = height - 1; }
    const startX = parseInt(canvas.dataset.startX || '-1', 10);
    const startY = parseInt(canvas.dataset.startY || '-1', 10);
    if (startX === -1 && startY === -1) {
      return;
    }
    const startData = parseInt(canvas.dataset.startData || '0', 10);
    if (newX === startX && newY === startY && startData === 1) {
      setPixel(newX, newY, 0);
      data[newY][newX] = 0;
      setData(data);
    }
    canvas.dataset.x = '-1';
    canvas.dataset.y = '-1';
    canvas.dataset.isPressed = 'false';
  }

  function handlePointerMove(event: MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    if (canvas.dataset.isPressed === 'true') {
      const data = getData();
      const rect = canvas.getBoundingClientRect();
      const totalSize = size + gridSize;
      let newX = Math.floor((event.clientX - rect.left) / totalSize);
      let newY = Math.floor((event.clientY - rect.top) / totalSize);
      const x = parseInt(canvas.dataset.x || '-1', 10);
      const y = parseInt(canvas.dataset.y || '-1', 10);
      if (newX === x && newY === y) { return; }
      if (newX >= width) { newX = width - 1; }
      if (newY >= height) { newY = height - 1; }
      canvas.dataset.x = `${newX}`;
      canvas.dataset.y = `${newY}`;
      const color = event.buttons === 32 ? 0 : 1;
      setPixel(newX, newY, color);
      data[newY][newX] = color;
      setData(data);
    }
  }

  function handlePointerEnter(event: MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    if (canvas.dataset.isPressed !== 'true' && !isEditing) {
      setIsEditing(true);
    }
  }

  function handlePointerLeave(event: MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    if (canvas.dataset.isPressed !== 'true') {
      setIsEditing(false);
    }
  }

  function redraw(ctx: CanvasRenderingContext2D) {
    // Clear
    //ctx.clearRect(0, 0, actualWidth, actualHeight);
    const data = getData();
    // Grid
    ctx.fillStyle = '#DDDDDD';
    for (let ix = 1; ix < width; ix++) {
      ctx.fillRect(ix * size, 0, 1, height * size);
    }
    for (let iy = 1; iy < height; iy++) {
      ctx.fillRect(0, iy * size, width * size, 1);
    }
    // Guides
    //ctx.drawImage(getGuides(width, height, size), 0, 0);
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

  /* function update() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) { return; }
    // Store Diff History
    debounce(() => {
      const changes = diffGrid(previous, data);
      if (changes.length === 0) { return; }
      history.push(changes);
      setHistory(history);
      setRedoHistory([]);
      previous = cloneGrid(data);
    }, 1000);
    // Redraw the canvas
    redraw(context);
  }*/

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === ' ') {
      console.log('space!')
    }
  }

  function handleKeyUp(event: KeyboardEvent) {

  }

  function handleContextMenu(event: MouseEvent) {
    event?.preventDefault();
  }

  function handleDoubleClick(event: MouseEvent) {
    event?.preventDefault();
  }

  return (
    <canvas ref={canvasRef}
      tabIndex={0}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      draggable="false"></canvas>
  );
});

export default Editor;
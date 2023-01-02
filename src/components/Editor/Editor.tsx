import {
  FunctionComponent,
  useState,
  MouseEvent,
} from 'react';
import bitmaskToPath from '@pictogrammers/bitmask-to-svg';
import './Editor.css';

const defaultPath = 'M20,30H30V20H20ZM20,60H10V10H40V40H20Z';
const guides = [
  {
    name: 'Circle Outer',
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

interface EditorProps {
  width?: number;
  height?: number;
  size?: number;
  onChange?: (e: string) => void;
}

function fillArray(width: number, height: number) {
  let arr = [];
  for (let y = 0; y <= height; y++) {
    const row = [];
    for (let x = 0; x <= width; x++) {
      row.push(0);
    }
    arr.push(row);
  }
  return arr;
}

const Editor: FunctionComponent<EditorProps> = (props) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [mode, setMode] = useState<'write' | 'erase'>('write');
  const [pressed, setPressed] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(props.width || 24);
  const [height, setHeight] = useState<number>(props.height || 24);
  const [size, setSize] = useState<number>(props.size || 10);
  const [path, setPath] = useState<string>(defaultPath);
  const [x, setX] = useState<number | null>(null);
  const [y, setY] = useState<number | null>(null);
  const defaultData = fillArray(width, height);
  const [data, setData] = useState<number[][]>(defaultData);

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
    data[newY][newX] = data[newY][newX] === 0 ? 1 : 0;
    setData(data);
    update();
    setPressed(true);
  }

  function handleMouseUp() {
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
      data[newY][newX] = event.buttons == 32 ? 0 : 1;
      setData(data);
      update();
    }
  }

  function handlePointerEnter(event: MouseEvent) {

  }

  function handlePointerLeave(event: MouseEvent) {
    
  }

  const actualWidth = width * size;
  const actualHeight = height * size;

  function update() {
    if (!context) { return; }
    context.clearRect(0, 0, actualWidth, actualHeight);
    // Grid
    context.fillStyle = '#DDDDDD';
    for (let ix = 0; ix < width; ix++) {
      context.fillRect(ix * size, 0, 1, height * size);
    }
    for (let iy = 0; iy < height; iy++) {
      context.fillRect(0, iy * size, width * size, 1);
    }
    // Guides
    guides.forEach(guide => {
      context.globalAlpha = guide.opacity;
      context.strokeStyle = guide.color;
      context.lineWidth = 1;
      context.fillStyle = 'transparent';
      context.beginPath();
      guide.lines.forEach((coordinates, i) => {
        if (i === 0) {
          context.moveTo(coordinates[0] * size + 0.5, coordinates[1] * size + 0.5);
        } else {
          context.lineTo(coordinates[0] * size + 0.5, coordinates[1] * size + 0.5);
        }
      });
      context.stroke();
    });
    context.globalAlpha = 1.0;
    // Icon
    context.fillStyle = '#000000';
    for (let iy = 0; iy < height; iy++) {
      for (let ix = 0; ix < width; ix++) {
        if (data[iy][ix] === 1) {
          context.fillRect(ix * size, iy * size, size, size);
        }
      }
    }

    const path = bitmaskToPath(data, { scale: 1 });
    if (props.onChange) {
      props.onChange(path);
    }
  }

  function init(node: HTMLCanvasElement | null) {
    if (node) {
      setCanvas(node);
      setContext(node.getContext('2d'));
      update();
    }
  }

  return (
    <canvas ref={init}
      width={actualWidth}
      height={actualHeight}
      onPointerDown={handleMouseDown}
      onPointerUp={handleMouseUp}
      onPointerMove={handleMouseMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      draggable="false"></canvas>
  );
};

export default Editor;
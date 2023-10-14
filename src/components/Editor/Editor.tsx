import {
  useState,
  MouseEvent,
  PointerEvent,
  KeyboardEvent,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from 'react';
import bitmaskToPath from '@pictogrammers/bitmask-to-svg';
import './Editor.css';
import cloneGrid from './utils/cloneGrid';
import { getGuides } from './utils/getGuides';
import fillGrid from './utils/fillGrid';
import iterateGrid from './utils/interateGrid';
import debounce from './utils/debounce';
import { WHITE } from './utils/constants';
import isEmptyGrid from './utils/isEmptyGrid';
import getLinePixels from './utils/getLinePixels';
import createLayer from './utils/createLayer';
import getRectanglePixels from './utils/getRectanglePixels';
import getRectangleOutlinePixels from './utils/getRectangleOutlinePixels';
import getEllipseOutlinePixels from './utils/getEllipseOutlinePixels';
import getEllipsePixels from './utils/getEllipsePixels';
import { InputMode } from './utils/inputMode';

const defaultColors = ['transparent', '#000'];

type SetIsEditingFunction = (editing: boolean) => void;
type GetIsEditingFunction = () => boolean;
type SetPixelFunction = (x: number, y: number, color: number) => void;
type SetGridFunction = (template: number[][], isEditing: boolean) => void;
type SetDataFunction = (template: number[][], offsetX?: number, offsetY?: number) => void;
type GetDataFunction = () => number[][];
type SetInputModeFunction = (mode: InputMode) => void;
type GetInputModeFunction = () => InputMode;
type Pixel = { x: number, y: number };
type SetPreviewFunction = (pixels: Pixel[], previousX: number, previousY: number) => void;
type InternalState = {
  isPressed: boolean,
  startColor: number,
  startX: number,
  startY: number,
  x: number,
  y: number
};
type SetInternalStateFunction = (obj: Partial<InternalState>) => void;
type GetInternalStateFunction = () => InternalState;

interface EditorProps {
  width?: number;
  height?: number;
  size?: number;
  colors?: string[];
  disableTransparency?: boolean;
  onChange?: (path: string) => void;
  onChangeData?: (data: number[][]) => void;
}

export type EditorJson = {
  width: Number;
  height: Number;
  meta: Map<string, string>;
  history: [];
  data: number[][];
  colors: EditorColor[];
  paths: string[];
}

export type EditorColor = {
  r: number;
  g: number;
  b: number;
  a: number;
  name: string;
}

export type EditorRef = {
  getColors: () => EditorColor[],
  addColor: (color: EditorColor) => void,
  updateColor: (index: number, color: EditorColor) => void,
  removeColor: (index: number) => void,
  moveColor: (fromIndex: number, toIndex: number) => void,
  mergeColor: (fromIndex: number, toIndex: number) => void,
  clear: () => void,
  clearHistory: () => void,
  applyTemplate: (data: number[][]) => void,
  flipHorizontal: () => void,
  flipVertical: () => void,
  translate: (x: number, y: number) => void,
  rotate: (counterClockwise?: boolean) => void,
  invert: () => void,
  undo: () => void,
  redo: () => void,
  hasUndo: () => boolean,
  hasRedo: () => boolean,
  inputModePixel: () => void,
  inputModeLine: () => void,
  inputModeRectangle: () => void,
  inputModeRectangleOutline: () => void,
  inputModeEllipse: () => void,
  inputModeEllipseOutline: () => void
};

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  console.log('--render--');
  useImperativeHandle(ref, () => ({
    getColors() {
      return [];
    },
    addColor(color: EditorColor) {
      //colors.push(color);
    },
    updateColor(index: number, color: EditorColor) {
      //colors[index](color);
    },
    removeColor(index: number) {
      colors.splice(index, 1);
    },
    moveColor(fromIndex: number, toIndex: number) {
      const temp = colors[toIndex];
      colors[toIndex] = colors[fromIndex];
      colors[fromIndex] = temp;
    },
    mergeColor(fromIndex: number, toIndex: number) {
      // ToDo: Code this
    },
    clear() {
      const clearedGrid = fillGrid(width, height);
      setData(clearedGrid);
    },
    clearHistory() {
      setHistory([]);
      setRedoHistory([]);
    },
    applyTemplate(template: number[][]) {
      setData(template);
    },
    flipHorizontal() {
      const data = getData();
      const cloned = cloneGrid(data);
      const w = cloned[0].length - 1;
      iterateGrid(data, (x, y) => {
        cloned[y][x] = data[y][w - x];
      });
      setData(cloned);
    },
    flipVertical() {
      const data = getData();
      const cloned = cloneGrid(data);
      const h = cloned.length - 1;
      iterateGrid(data, (x, y) => {
        cloned[y][x] = data[h - y][x];
      });
      setData(cloned);
    },
    translate(translateX: number, translateY: number) {
      const data = getData();
      const cloned = fillGrid(width, height);
      for (let iy = 0; iy < height; iy++) {
        cloned[iy].fill(0);
      }
      iterateGrid(data, (x, y) => {
        if (y - translateY < 0
          || x - translateX < 0
          || y - translateY >= height
          || x - translateX >= width) {
          return;
        }
        cloned[y][x] = data[y - translateY][x - translateX];
      });
      setData(cloned);
    },
    invert() {
      // Only works with 2 colors
      if (colors.length > 2) {
        return;
      }
      const data = getData();
      const cloned = cloneGrid(data);
      iterateGrid(cloned, (x, y) => {
        cloned[y][x] = cloned[y][x] === 0 ? 1 : 0;
      });
      setData(cloned);
    },
    undo() {
      // ToDo: Rewrite to use new history api
      const revert = history.pop();
      if (!revert) { return; }
      setHistory(history);
      redoHistory.push(revert);
      setRedoHistory(redoHistory);
      const data = getData();
      revert?.forEach((item) => {
        const [x, y] = item;
        data[y][x] = item[2];
        setData(data);
        setGrid(data, false);
      });
    },
    redo() {
      // ToDo: Rewrite to use new history api
      const revert = redoHistory.pop();
      if (!revert) { return; }
      history.push(revert);
      setHistory(history);
      setRedoHistory(redoHistory);
      const data = getData();
      revert?.forEach((item) => {
        const [x, y] = item;
        data[y][x] = item[3];
        setData(data);
        setGrid(data, false);
      });
    },
    rotate(counterClockwise: boolean = false) {
      const data = getData();
      const cloned = cloneGrid(data);
      if (counterClockwise) {
        const newData = data[0].map((val, index) => data.map(row => row[row.length - 1 - index]));
        for (let iy = 0; iy < height; iy++) {
          for (let ix = 0; ix < width; ix++) {
            cloned[iy][ix] = newData[iy][ix];
          }
        }
      } else {
        const newData = data[0].map((val, index) => data.map(row => row[index]).reverse());
        for (let iy = 0; iy < height; iy++) {
          for (let ix = 0; ix < width; ix++) {
            cloned[iy][ix] = newData[iy][ix];
          }
        }
      }
      setData(cloned);
    },
    hasUndo() {
      return history.length !== 0;
    },
    hasRedo() {
      return redoHistory.length !== 0;
    },
    inputModePixel() {
      setInputMode(InputMode.Pixel);
    },
    inputModeLine() {
      setInputMode(InputMode.Line);
    },
    inputModeRectangle() {
      setInputMode(InputMode.Rectangle);
    },
    inputModeRectangleOutline() {
      setInputMode(InputMode.RectangleOutline);
    },
    inputModeEllipse() {
      setInputMode(InputMode.Ellipse);
    },
    inputModeEllipseOutline() {
      setInputMode(InputMode.EllipseOutline);
    },
  }));

  const [width, setWidth] = useState<number>(props.width || 24);
  const [height, setHeight] = useState<number>(props.height || 24);
  const [size, setSize] = useState<number>(props.size || 10);
  const [gridSize, setGridSize] = useState<number>(1);
  const [colors, setColors] = useState<string[]>(props.colors || defaultColors);
  const [history, setHistory] = useState<number[][][]>([]);
  const [redoHistory, setRedoHistory] = useState<number[][][]>([]);
  const [setInternalState, setSetInternalState] = useState<SetInternalStateFunction>(() => () => console.log('ERROR'));
  const [getInternalState, setGetInternalState] = useState<GetInternalStateFunction>(() => () => {
    console.log('ERROR');
    return {
      isPressed: false,
      startColor: -1,
      startX: -1,
      startY: -1,
      x: -1,
      y: -1,
      previousX: -1,
      previousY: -1
    };
  });
  const [setIsEditing, setSetIsEditing] = useState<SetIsEditingFunction>(() => () => console.log('ERROR'));
  const [getIsEditing, setGetIsEditing] = useState<GetIsEditingFunction>(() => () => { console.log('ERROR'); return true; });
  const [setPixel, setSetPixel] = useState<SetPixelFunction>(() => () => console.log('ERROR'));
  const [setGrid, setSetGrid] = useState<SetGridFunction>(() => () => console.log('ERROR'));
  const [setData, setSetData] = useState<SetDataFunction>(() => () => console.log('ERROR'));
  const [getData, setGetData] = useState<GetDataFunction>(() => () => { console.log('ERROR'); return []; });
  const [setInputMode, setSetInputMode] = useState<SetInputModeFunction>(() => () => console.log('ERROR'));
  const [getInputMode, setGetInputMode] = useState<GetInputModeFunction>(() => () => { console.log('ERROR'); return InputMode.Pixel; });
  const [setPreview, setSetPreview] = useState<SetPreviewFunction>(() => () => console.log('ERROR'));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Init for width, height, size
  useEffect(() => {
    console.log('INIT', width, height, size);
    const data: number[][] = fillGrid(width, height);
    let isEditing = false;
    let inputMode = InputMode.Pixel;
    const internalState = {
      isPressed: false,
      startColor: -1,
      startX: -1,
      startY: -1,
      x: -1,
      y: -1,
      previousX: -1,
      previousY: -1
    };
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    const totalSize = size + gridSize;
    const actualWidth = width * totalSize - gridSize;
    const actualHeight = height * totalSize - gridSize;
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    const context = canvas.getContext('2d');
    if (!context) { return; }
    const [baseLayer, baseLayerContext] = createLayer(actualWidth, actualHeight);
    const [editLayer, editLayerContext] = createLayer(actualWidth, actualHeight);
    const [noEditLayer, noEditLayerContext] = createLayer(actualWidth, actualHeight);
    const [previewLayer, previewLayerContext] = createLayer(actualWidth, actualHeight);
    const handleChange = () => {
      const path = bitmaskToPath(data, { scale: 1 });
      console.log('change:', path);
      if (props.onChange) {
        props.onChange(path);
      }
      if (props.onChangeData) {
        props.onChangeData(data);
      }
    };
    // Group all pixel changes every second
    let delayTimer = 0;
    const delayedChange = () => {
      clearInterval(delayTimer);
      delayTimer = window.setTimeout(handleChange, 1000);
    };
    // Local Methods
    const setPixelLocal = (x: number, y: number, color: number) => {
      if (x > width) {
        throw new Error(`Invalid x; ${x} > ${width}`);
      }
      if (y > height) {
        throw new Error(`Invalid y; ${y} > ${height}`);
      }
      // Edit Layer
      editLayerContext.fillStyle = WHITE;
      editLayerContext.fillRect(
        x * totalSize - (gridSize) + 1,
        y * totalSize - (gridSize) + 1,
        size + (gridSize * 2) - 2,
        size + (gridSize * 2) - 2
      );
      editLayerContext.fillStyle = colors[color] === 'transparent' ? WHITE : colors[color];
      editLayerContext.fillRect(x * totalSize + 1, y * totalSize + 1, size - 2, size - 2);
      // No Edit Layer
      noEditLayerContext.fillStyle = colors[color] === 'transparent' ? WHITE : colors[color];
      noEditLayerContext.fillRect(x * totalSize, y * totalSize, size, size);
      // Update pixel grid
      /*if (!props.disableTransparency && colors[color] === 'transparent') {
        pixelContext.fillStyle = '#DDD';
        pixelContext.fillRect(x * totalSize + 1, y * totalSize + 1, size, size);
        pixelContext.fillStyle = WHITE;
        pixelContext.fillRect(x * totalSize + 1, y * totalSize + 1, 5, 5);
        pixelContext.fillRect(x * totalSize + 6, y * totalSize + 6, 5, 5);
      } else {*/
      // base layer to main canvas
      context.drawImage(
        baseLayer,
        x * totalSize, y * totalSize, size + 2, size + 2,
        x * totalSize, y * totalSize, size + 2, size + 2
      );
      // editing layer to main canvas
      context.drawImage(
        isEditing ? editLayer : noEditLayer,
        x * totalSize, y * totalSize, size + 2, size + 2,
        x * totalSize, y * totalSize, size + 2, size + 2
      );
      console.log('draw pixel(x, y, color, data):', x, y, color, data[y][x]);
      // Verify this is the only place setting pixel data!
      data[y][x] = color;
      delayedChange();
    };
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
            // Lazy this should be doing everything, this is not optimial
            setPixelLocal(x + offsetX, y + offsetY, color);
          }
        });
        if (hasChanges) {
          console.log('Region:', minX, maxX, minY, maxY);
        } else {
          console.log('Region: No Changes');
        }
      };
    });
    // getData
    setGetData(() => {
      return () => {
        return data;
      }
    });
    // setIsEditing
    setSetIsEditing(() => {
      return (editing: boolean) => {
        isEditing = editing;
        // base layer to main canvas
        context.drawImage(baseLayer, 0, 0);
        // editing layer to main canvas
        context.drawImage(editing ? editLayer : noEditLayer, 0, 0);
      };
    });
    // getIsEditing
    setGetIsEditing(() => {
      return () => {
        return isEditing;
      }
    });
    // setInternalState
    setSetInternalState(() => {
      return (obj: InternalState) => {
        Object.assign(internalState, obj);
      };
    });
    // getInternalState
    setGetInternalState(() => {
      return () => {
        return internalState;
      }
    });
    // setInputMode
    setSetInputMode(() => {
      return (mode: InputMode) => {
        inputMode = mode;
      }
    });
    // getInputMode
    setGetInputMode(() => {
      return () => {
        return inputMode;
      }
    });
    setSetGrid(() => {
      return () => {
        // base layer to main canvas
        context.drawImage(baseLayer, 0, 0);
        // editing layer to main canvas
        context.drawImage(editLayer, 0, 0);
      };
    });
    // Init setPixel
    setSetPixel(() => {
      return setPixelLocal;
    });
    // setPreview
    setSetPreview(() => {
      return (pixels: Pixel[], previousX: number, previousY: number) => {
        const { minX, maxX, minY, maxY } = pixels.reduce((previous, current) => {
          return {
            minX: Math.min(previous.minX, current.x, previousX),
            maxX: Math.max(previous.maxX, current.x, previousX),
            minY: Math.min(previous.minY, current.y, previousY),
            maxY: Math.max(previous.maxY, current.y, previousY)
          };
        }, { minX: width, maxX: 0, minY: height, maxY: 0 });
        // base layer to main canvas
        context.drawImage(
          baseLayer,
          minX * totalSize, minY * totalSize, maxX * totalSize, maxY * totalSize,
          minX * totalSize, minY * totalSize, maxX * totalSize, maxY * totalSize
        );
        // edit to main canvas
        context.drawImage(
          editLayer,
          minX * totalSize, minY * totalSize, maxX * totalSize, maxY * totalSize,
          minX * totalSize, minY * totalSize, maxX * totalSize, maxY * totalSize
        );
        // preview layer
        previewLayerContext.clearRect(0, 0, actualWidth, actualHeight);
        pixels.forEach(({ x, y }) => {
          previewLayerContext.fillStyle = WHITE;
          previewLayerContext.beginPath();
          previewLayerContext.arc(x * totalSize + 5, y * totalSize + 5, 3, 0, 2 * Math.PI);
          previewLayerContext.closePath();
          previewLayerContext.fill();
          previewLayerContext.fillStyle = '#1B79C8';
          previewLayerContext.beginPath();
          previewLayerContext.arc(x * totalSize + 5, y * totalSize + 5, 2, 0, 2 * Math.PI);
          previewLayerContext.closePath();
          previewLayerContext.fill();
        });
        // preview layer to main canvas
        context.drawImage(
          previewLayer,
          minX * totalSize, minY * totalSize, maxX * totalSize, maxY * totalSize,
          minX * totalSize, minY * totalSize, maxX * totalSize, maxY * totalSize
        );
        console.log('render preview', minX, minY, maxX, maxY);
      };
    })
    // Inital Rendering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = data[y][x];
        editLayerContext.fillStyle = WHITE;
        editLayerContext.fillRect(
          x * totalSize,
          y * totalSize,
          size,
          size
        );
        editLayerContext.fillStyle = colors[color];
        editLayerContext.fillRect(
          x * totalSize + gridSize,
          y * totalSize + gridSize,
          size - (gridSize * 2),
          size - (gridSize * 2)
        );
        noEditLayerContext.fillStyle = colors[color];
        noEditLayerContext.fillRect(
          x * totalSize,
          y * totalSize,
          size,
          size
        );
      }
    }
    const guides = getGuides(width, height, size, gridSize);
    baseLayerContext.drawImage(guides, 0, 0);
    context.drawImage(baseLayer, 0, 0);
  }, [width, height, size, gridSize]);

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

  function handlePointerDown(event: MouseEvent) {
    if (event.buttons !== 1 && event.buttons !== 32) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const canvas = canvasRef.current;
    const data = getData();
    const inputMode = getInputMode();
    if (!canvas) { return; }
    const rect = canvas.getBoundingClientRect();
    const totalSize = size + gridSize;
    let newX = Math.floor((event.clientX - rect.left) / totalSize);
    let newY = Math.floor((event.clientY - rect.top) / totalSize);
    const { x, y } = getInternalState();
    if (newX === x && newY === y) { return; }
    if (newX >= width) { newX = width - 1; }
    if (newY >= height) { newY = height - 1; }
    setInternalState({
      isPressed: true,
      startColor: data[newY][newX],
      startX: newX,
      startY: newY,
      x: newX,
      y: newY
    });
    const color = event.buttons === 32 ? 0 : 1;
    switch (inputMode) {
      case InputMode.Pixel:
        setPixel(newX, newY, color);
        data[newY][newX] = color;
        break;
    }
    console.log(inputMode, newX, newY);
  }

  function handlePointerUp(event: MouseEvent) {
    const canvas = canvasRef.current;
    const data = getData();
    const inputMode = getInputMode();
    if (!canvas) { return; }
    const rect = canvas.getBoundingClientRect();
    const totalSize = size + gridSize;
    let newX = Math.floor((event.clientX - rect.left) / totalSize);
    let newY = Math.floor((event.clientY - rect.top) / totalSize);
    if (newX >= width) { newX = width - 1; }
    if (newY >= height) { newY = height - 1; }
    const { startX, startY, startColor } = getInternalState();
    if (startX === -1 && startY === -1) {
      return;
    }
    // Single Tap
    if (newX === startX && newY === startY && startColor === 1) {
      switch (inputMode) {
        case InputMode.Pixel:
          setPixel(newX, newY, 0);
          data[newY][newX] = 0;
          break;
      }
    } else {
      switch (inputMode) {
        case InputMode.Line:
          getLinePixels(startX, startY, newX, newY).forEach(({ x, y }) => {
            setPixel(x, y, 1);
          });
          break;
        case InputMode.Rectangle:
          getRectanglePixels(startX, startY, newX, newY).forEach(({ x, y }) => {
            setPixel(x, y, 1);
          });
          break;
        case InputMode.RectangleOutline:
          getRectangleOutlinePixels(startX, startY, newX, newY).forEach(({ x, y }) => {
            setPixel(x, y, 1);
          });
          break;
        case InputMode.Ellipse:
          getEllipseOutlinePixels(startX, startY, newX, newY).forEach(({ x, y }) => {
            setPixel(x, y, 1);
          });
          break;
        case InputMode.EllipseOutline:
          getEllipseOutlinePixels(startX, startY, newX, newY).forEach(({ x, y }) => {
            setPixel(x, y, 1);
          });
          break;
      }
    }
    setInternalState({
      x: -1,
      y: -1,
      isPressed: false
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    const { isPressed } = getInternalState();
    if (isPressed) {
      const data = getData();
      const inputMode = getInputMode();
      const rect = canvas.getBoundingClientRect();
      const totalSize = size + gridSize;
      const points = [];
      const { startX, startY, x, y } = getInternalState();
      // If supported get all the inbetween points
      // really noticable for pen support + pencil tool
      if (typeof event.nativeEvent.getCoalescedEvents === 'function') {
        const events = event.nativeEvent.getCoalescedEvents();
        for (const evt of events) {
          let tX = Math.floor((evt.clientX - rect.left) / totalSize);
          let tY = Math.floor((evt.clientY - rect.top) / totalSize);
          if (tX === x && tY === y) {
            continue;
          }
          points.push([tX, tY]);
        }
      } else {
        let newX = Math.floor((event.clientX - rect.left) / totalSize);
        let newY = Math.floor((event.clientY - rect.top) / totalSize);
        if (newX === x && newY === y) { return; }
        if (newX >= width) { newX = width - 1; }
        if (newY >= height) { newY = height - 1; }
        points.push([newX, newY]);
      }
      // Is Eraser
      const color = event.buttons === 32 ? 0 : 1;
      // Shape tools only care about the last point
      if (points.length === 0) { return; }
      const [lastX, lastY] = points.at(-1) as [number, number];
      // This is not ideal, but might be good enough,
      // really it should be finding the point furthest absolute
      // point from startX/startY.
      setInternalState({
        x: lastX,
        y: lastY
      });
      switch (inputMode) {
        case InputMode.Pixel:
          for (var point of points) {
            setPixel(point[0], point[1], color);
            data[point[1]][point[0]] = color;
          }
          break;
        case InputMode.Line:
          console.log(x, y)
          setPreview(getLinePixels(startX, startY, lastX, lastY), x, y);
          break;
        case InputMode.Rectangle:
          setPreview(getRectanglePixels(startX, startY, lastX, lastY), x, y);
          break;
        case InputMode.RectangleOutline:
          setPreview(getRectangleOutlinePixels(startX, startY, lastX, lastY), x, y);
          break;
        case InputMode.Ellipse:
          setPreview(getEllipseOutlinePixels(startX, startY, lastX, lastY), x, y);
          break;
        case InputMode.EllipseOutline:
          setPreview(getEllipseOutlinePixels(startX, startY, lastX, lastY), x, y);
          break;
      }
    }
  }

  function handlePointerEnter(event: MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    const { isPressed } = getInternalState();
    if (!isPressed && !getIsEditing()) {
      setIsEditing(true);
    }
    console.log('enter');
  }

  function handlePointerLeave(event: MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    const { isPressed } = getInternalState();
    if (!isPressed) {
      setIsEditing(false);
    }
    console.log('leave');
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
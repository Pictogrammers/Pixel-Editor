# Pixel-Editor

Browser based Pixel Editor for creating pixel assets or fonts.

- Editor
  - Self contained React drawing canvas.
- Application
  - Work in Progress Features
    - Eraser (pen erasers work on tablets)
    - Shapes (Line, Rect, Circle)
    - Cache state to `localStorage` to persist changes

## Editor Canvas

Majority of the functionality lives in the `Editor` component.

> Any contributions or updates to the Editor component must be self contained.

### Props

- `width` - Image width
- `height` - Image height
- `size` - Grid size
- `onChange` - Get the path data on change.

> **Note:** `onChange` criteria for triggering:
> - 1 second after any concurrent drawing.
> - Instantly after undo/redo actions.

### Methods

- `addColor: (color: Color) => void`
- `updateColor: (index: number, color: Color) => void`
- `removeColor: (index: number, mergeIntoIndex: number) => void`
- `moveColor: (fromIndex: number, toIndex: number) => void`
- `clear: () => void`
- `clearHistory: () => void`
- `applyTemplate: (data: number[][]) => void`
- `flipHorizontal: () => void`
- `flipVertical: () => void`
- `translate: (x: number, y: number) => void`
- `rotate: (counterClockwise?: boolean) => void`
- `undo: () => void`
- `redo: () => void`
- `hasUndo: () => boolean`
- `hasRedo: () => boolean`
- `inputModePixel: () => void`
- `inputModeLine: () => void`
- `inputModeRectangle: () => void`
- `inputModeRectangleOutline: () => void`
- `inputModeEllipse: () => void`
- `inputModeEllipseOutline: () => void`

### Usage

```tsx
import Editor, { EditorRef } from '@pictogrammers/editor';

function App() {
  const editorRef = useRef<EditorRef>(null);
  const width = 22;
  const height = 22;
  const size = 10; // Grid size

  function handleChange(path: string) {
    console.log('Path:', path);
  }

  function handleClear() {
    editorRef.current?.clear();
  }

  return (
    <Editor ref={editorRef}
            width={width}
            height={height}
            size={size}
            onChange={handleChange}></Editor>
    <button onClick={handleClear}>Clear</button>
  );
}

export default App;
```

### Managing Data

The `data` grid stores each pixel as a reference to the colors array. A diagonal line in a 3x3 canvas would look like below.

```tsx
data = [
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0]
]
```

See the helper methods above for all the quick operations for modify the data grid.

### Managing Colors

The `data` grid stores each pixel as a reference to the colors array. For example `1` in the data grid would be the 2nd item in the colors array. The color object looks like below:

```tsx
type Color = {
  r: number;    // Red 0 to255
  g: number;    // Green 0 to 255
  b: number;    // Blue 0 to 255
  a: number;    // Alpha 0 to 1
  name: string; // Friendly name
}
```

The default `colors` array then looks like below:

```tsx
colors = [
  { r: 0, g: 0, b: 0, a: 0, name: 'transparent' },
  { r: 0, g: 0, b: 0, a: 1, name: 'Black' }
]
```

To ensure the indexes in the `data` grid stays in sync with the `colors` array the helper methods below are provided.

- `addColor(color: Color)`
  - Add a new color to the end of the array.
- `updateColor: (index: number, color: Color)`
  - Update the color value.
- `removeColor: (index: number, mergeIntoIndex: number)`
  - Removing a color requires selecting an existing color.
  - This operation throws an error for less than 2 colors.
- `moveColor: (fromIndex: number, toIndex: number)`
  - Swap the position of 2 colors.
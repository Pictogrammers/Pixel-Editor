# Pixel-Editor

Browser based Pixel Editor for creating pixel assets or fonts.

- Editor
  - Self contained React drawing canvas.
- Application
  - Work in Progress Features
    - Drawing triggers React lifecycle causing lag
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

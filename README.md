# Pixel-Editor

Browser Based Pixel Editor

## Editor Canvas

Majority of the functionality lives in the `Editor` component.

### Props

- `width` - Image width
- `height` - Image height
- `size` - Grid size
- `onChange` - Get the path data on change.

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
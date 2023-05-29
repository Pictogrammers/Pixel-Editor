# Editor

Self contained pixel canvas render. Wide scope of features are supported.

> See the root [README.md](../) for a list of features.

## Rendering Layers

From the lowest layer to the highest layer. In memory there are 4 layers

- Base Layer
  - Background - White or transparent checkerboard
  - Grid - Gray lines
  - Guidelines - Document configurable
- Drawing Layers
  - Editing Layer - Small squares with padding
  - Not Editing Layer - Large squares
- Tools Layer
  - Pixel
    - No preview
    - Holding shift only draws horizontal or vertical
  - Line
    - Pointer down draws a preview
    - Hold shift for straight lines
    - Hold ctrl for isometric lines
    - Displays absolute x, y diff
  - Rectangle
    - Hold shift for squares
    - Displays absolute x, y diff
  - Ellipse
    - Hold shift for perfect circle
    - Displays absolute x, y diff

> ESC during any operation will cancel the interaction.

## ToDo

- Shortcuts
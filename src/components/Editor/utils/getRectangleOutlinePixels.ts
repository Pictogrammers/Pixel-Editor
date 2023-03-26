export default function getRectanglePixels(x0: number, y0: number, x1: number, y1: number) {
  const pixels = [];
  const oX = Math.min(x0, x1);
  const oY = Math.min(y0, y1);
  var w = Math.abs(x1 - x0) + 1;
  var h = Math.abs(y1 - y0) + 1;

  // Vertical
  for (var y = oY; y < oY + h; y++) {
    pixels.push({ x: oX, y });
    pixels.push({ x: oX + w, y });
  }
  // Horizontal (minus the vertical squares)
  for (var x = oX + 1; x < oX + w - 1; x++) {
    pixels.push({ x, y: oY });
    pixels.push({ x, y: oY + h });
  }

  return pixels;
}

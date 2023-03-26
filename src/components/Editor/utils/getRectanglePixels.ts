export default function getRectanglePixels(x0: number, y0: number, x1: number, y1: number) {
  const pixels = [];
  var dx = Math.abs(x1 - x0);
  var dy = Math.abs(y1 - y0);
  var sx = (x0 < x1) ? 1 : -1;
  var sy = (y0 < y1) ? 1 : -1;

  for (var y = sy; y < dy; y++) {
    for (var x = sx; x < dx; x++) {
      pixels.push({ x, y });
    }
  }

  return pixels;
}

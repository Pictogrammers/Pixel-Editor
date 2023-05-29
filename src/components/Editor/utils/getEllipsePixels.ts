export default function getEllipsePixels(x0: number, y0: number, x1: number, y1: number) {
  let a = Math.abs(x1 - x0), b = Math.abs(y1 - y0), b1 = b & 1; /* values of diameter */
  let dx = 4 * (1 - a) * b * b, dy = 4 * (b1 + 1) * a * a; /* error increment */
  let err = dx + dy + b1 * a * a, e2; /* error of 1.step */

  if (x0 > x1) { x0 = x1; x1 += a; } /* if called with swapped points */
  if (y0 > y1) y0 = y1; /* .. exchange them */
  y0 += (b + 1) / 2; y1 = y0 - b1;   /* starting pixel */
  a *= 8 * a; b1 = 8 * b * b;
  const pixels = [];
  do {
    pixels.push({ x: x1, y: y0 }); /*   I. Quadrant */
    pixels.push({ x: x0, y: y0 }); /*  II. Quadrant */
    pixels.push({ x: x0, y: y1 }); /* III. Quadrant */
    pixels.push({ x: x1, y: y1 }); /*  IV. Quadrant */
    e2 = 2 * err;
    if (e2 <= dy) { y0++; y1--; err += dy += a; }  /* y step */
    if (e2 >= dx || 2 * err > dy) { x0++; x1--; err += dx += b1; } /* x step */
  } while (x0 <= x1);

  while (y0 - y1 < b) {  /* too early stop of flat ellipses a=1 */
    pixels.push({ x: x0 - 1, y: y0 }); /* -> finish tip of ellipse */
    pixels.push({ x: x1 + 1, y: y0++ });
    pixels.push({ x: x0 - 1, y: y1 });
    pixels.push({ x: x1 + 1, y: y1-- });
  }
  return pixels;
}
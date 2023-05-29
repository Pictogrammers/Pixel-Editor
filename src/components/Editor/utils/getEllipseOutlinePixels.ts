function circle(x0: number, y0: number, x1: number, y1: number) {
  let r = Math.abs(x0 - x1) / 2;
  console.log('circle', r);
  const xm = Math.min(x0, x1) + r;
  const ym = Math.min(y0, y1) + r;
  let x = -r, y = 0, err = 2 - 2 * r;         /* bottom left to top right */
  const pixels = [];
  do {
    pixels.push({ x: xm - x, y: ym + y });    /*   I. Quadrant +x +y */
    pixels.push({ x: xm - y, y: ym - x });    /*  II. Quadrant -x +y */
    pixels.push({ x: xm + x, y: ym - y });    /* III. Quadrant -x -y */
    pixels.push({ x: xm + y, y: ym + x });    /*  IV. Quadrant +x -y */
    r = err;
    if (r <= y) err += ++y * 2 + 1;           /* y step */
    if (r > x || err > y) err += ++x * 2 + 1; /* x step */
  } while (x < 0);
  return pixels;
}

export function distance(x: number, y: number, ratio: number): number {
	return Math.sqrt((Math.pow(y * ratio, 2)) + Math.pow(x, 2));
}

function filled(x: number, y: number, radius: number, ratio: number): boolean {
	return distance(x, y, ratio) <= radius;
}

function thinfilled(x: number, y: number, radius: number, ratio: number): boolean {
	return filled(x, y, radius, ratio) && !(
		filled(x + 1, y, radius, ratio) &&
		filled(x - 1, y, radius, ratio) &&
		filled(x, y + 1, radius, ratio) &&
		filled(x, y - 1, radius, ratio)
	);
}

function isFilled(x: number, y: number, width: number, height: number): boolean {
  const bounds = {
    minX: 0,
    maxX: width,
    minY: 0,
    maxY: height,
  };

  x = -.5 * (bounds.maxX - 2 * (x + .5));
  y = -.5 * (bounds.maxY - 2 * (y + .5));

  return thinfilled(x, y, (bounds.maxX / 2), bounds.maxX / bounds.maxY);
}

function betterCircle(x0: number, y0: number, x1: number, y1: number) {
  const width = Math.abs(x0 - x1);
  const height = Math.abs(y0 - y1);
  const minX = Math.min(x0, x1);
  const minY = Math.min(y0, y1);

  const pixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isFilled(x, y, width, height)) {
        pixels.push({ x: x + minX, y: y + minY });
      }
    }
  }
  return pixels;
}

function ellipse(x0: number, y0: number, x1: number, y1: number) {
  const pixels = [];
  var a = Math.abs(x1 - x0), b = Math.abs(y1 - y0), b1 = b & 1; /* diameter */
  var dx = 4 * (1.0 - a) * b * b, dy = 4 * (b1 + 1) * a * a;    /* error increment */
  var err = dx + dy + b1 * a * a, e2;                           /* error of 1.step */

  if (x0 > x1) { x0 = x1; x1 += a; }        /* if called with swapped points */
  if (y0 > y1) y0 = y1;                     /* .. exchange them */
  y0 += (b + 1) >> 1; y1 = y0 - b1;         /* starting pixel */
  a = 8 * a * a; b1 = 8 * b * b;

  do {
    pixels.push({ x: x1, y: y0 });          /*   I. Quadrant */
    pixels.push({ x: x0, y: y0 });          /*  II. Quadrant */
    pixels.push({ x: x0, y: y1 });          /* III. Quadrant */
    pixels.push({ x: x1, y: y1 });          /*  IV. Quadrant */
    e2 = 2 * err;
    if (e2 <= dy) { y0++; y1--; err += dy += a; }                 /* y step */
    if (e2 >= dx || 2 * err > dy) { x0++; x1--; err += dx += b1; }       /* x */
  } while (x0 <= x1);

  while (y0 - y1 <= b) {                /* too early stop of flat ellipses a=1 */
    pixels.push({ x: x0 - 1, y: y0 });                         /* -> finish tip of ellipse */
    pixels.push({ x: x1 + 1, y: y0++ });
    pixels.push({ x: x0 - 1, y: y1 });
    pixels.push({ x: x1 + 1, y: y1-- });
  }

  return pixels;
}

export default function getEllipseOutlinePixels(x0: number, y0: number, x1: number, y1: number) {
  if (Math.abs(x0 - x1) === Math.abs(y0 - y1) && Math.abs(x0 - x1)) {
    console.log('circle', Math.abs(x0 - x1), Math.abs(y0 - y1))
    return betterCircle(x0, y0, x1 + 1, y1 + 1);
  }
  return ellipse(x0, y0, x1, y1);
}

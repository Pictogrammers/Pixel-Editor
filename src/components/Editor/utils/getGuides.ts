interface Guide {
  name: string;
  width?: number;
  height?: number;
  color: string;
  opacity: number;
  lines: number[][];
}

const guides: Guide[] = [
  {
    name: 'Circle Outer',
    width: 22,
    height: 22,
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
    width: 22,
    height: 22,
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
    width: 22,
    height: 22,
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

const cache = new Map();

/**
 * This should generate an image and cache it!!!!!!!!!!!!!!!!!!!!!
 * 
 * @param width Width
 * @param height Height
 * @returns ctx cache
 */
export default function getGuides(width: number, height: number, size: number): CanvasImageSource {
  const cacheKey = `${width}:${height}:${size}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  let filteredGuides = guides.filter(g => {
    return g.width === width && g.height === height;
  });
  if (filteredGuides.length === 0) {
    // Always render center lines for even sizes
    if (width % 2 === 0 && height % 2 === 0) {
      filteredGuides =  [
        {
          name: 'Horizontal',
          color: '#00F',
          opacity: 0.4,
          lines: [
            [0, height / 2],
            [width, height / 2]
          ]
        },
        {
          name: 'Vertical',
          color: '#00F',
          opacity: 0.4,
          lines: [
            [width / 2, 0],
            [width / 2, height]
          ]
        }
      ]
    }
  }
  // Cache grid to an image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = width * size;
  canvas.height = height * size;
  filteredGuides.forEach(guide => {
    ctx.globalAlpha = guide.opacity;
    ctx.strokeStyle = guide.color;
    ctx.lineWidth = 1;
    ctx.fillStyle = 'transparent';
    ctx.beginPath();
    guide.lines.forEach((coordinates, i) => {
      if (i === 0) {
        ctx.moveTo(coordinates[0] * size + 0.5, coordinates[1] * size + 0.5);
      } else {
        ctx.lineTo(coordinates[0] * size + 0.5, coordinates[1] * size + 0.5);
      }
    });
    ctx.stroke();
  });
  cache.set(cacheKey, canvas);
  return canvas;
}
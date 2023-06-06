type Guide = {
  name: string;
  width?: number;
  height?: number;
  color: string;
  opacity: number;
  lines: number[][];
  dashed?: number[];
  dashOffset?: number;
}

const guides: Guide[] = [
  {
    name: 'Circle Outer',
    width: 22,
    height: 22,
    color: '#F00',
    opacity: 1.0,
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
    opacity: 1.0,
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
    color: '#9932cc',
    opacity: 1.0,
    dashed: [4, 4],
    lines: [
      [2, 2],
      [20, 2],
      [20, 20],
      [2, 20],
      [2, 2]
    ]
  },
  {
    name: 'Square',
    width: 22,
    height: 22,
    color: '#9932cc',
    opacity: 0.1,
    dashed: [4, 4],
    dashOffset: 4,
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

export function clearGuides() {
  cache.clear();
}

/**
 * This should generate an image and cache it!!!!!!!!!!!!!!!!!!!!!
 * 
 * @param width Width
 * @param height Height
 * @returns ctx cache
 */
export function getGuides(width: number, height: number, size: number, gridSize: number): CanvasImageSource {
  const cacheKey = `${width}:${height}:${size}:${gridSize}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  let filteredGuides = guides.filter(g => {
    return g.width === width && g.height === height;
  });
  // Guides
  if (filteredGuides.length === 0) {
    // Always render center lines for even sizes
    if (width % 2 === 0 && height % 2 === 0) {
      filteredGuides =  [
        {
          name: 'Horizontal',
          color: '#00F',
          opacity: 1.0,
          lines: [
            [0, height / 2],
            [width, height / 2]
          ]
        },
        {
          name: 'Vertical',
          color: '#00F',
          opacity: 1.0,
          lines: [
            [width / 2, 0],
            [width / 2, height]
          ]
        }
      ]
    }
  }
  // Canvas Size
  const totalSize = size + gridSize;
  const actualWidth = ((width * totalSize) - gridSize);
  const actualHeight = ((height * totalSize) - gridSize);
  // Cache grid to an image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = actualWidth;
  canvas.height = actualHeight;
  // Grid
  if (gridSize !== 0) {
    ctx.fillStyle = '#BBB';
    for (let x = 1; x < width; x++) {
      ctx.fillRect(x * totalSize - gridSize, 0, 1, actualHeight);
    }
    for (let y = 1; y < height; y++) {
      ctx.fillRect(0, y * totalSize - gridSize, actualWidth, 1);
    }
  }
  // Guides
  filteredGuides.forEach(guide => {
    ctx.lineDashOffset = guide.dashOffset || 0;
    ctx.setLineDash(guide.dashed || [1]);
    ctx.strokeStyle = guide.color;
    ctx.globalAlpha = guide.opacity;
    ctx.lineWidth = 1;
    ctx.fillStyle = 'transparent';
    ctx.beginPath();
    guide.lines.forEach((coordinates, i) => {
      if (i === 0) {
        ctx.moveTo(coordinates[0] * (size + gridSize) - 0.5, coordinates[1] * (size + gridSize) - 0.5);
      } else {
        ctx.lineTo(coordinates[0] * (size + gridSize) - 0.5, coordinates[1] * (size + gridSize) - 0.5);
      }
    });
    ctx.stroke();
  });
  cache.set(cacheKey, canvas);
  return canvas;
}
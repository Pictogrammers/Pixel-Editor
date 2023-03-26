type CanvasArray = [HTMLCanvasElement, CanvasRenderingContext2D];

export default function createCanvas(width: number, height: number): CanvasArray {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d') as CanvasRenderingContext2D];
}

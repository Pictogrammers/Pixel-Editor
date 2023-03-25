export default function isEmptyGrid(grid: number[][]) {
  return grid.flat().every(v => v === 0);
}
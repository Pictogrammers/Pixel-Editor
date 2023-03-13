export default function fillGrid(width: number, height: number) {
  let arr = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(0);
    }
    arr.push(row);
  }
  return arr;
}
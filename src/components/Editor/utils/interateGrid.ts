export default function iterateGrid(data: number[][], callback: (color: number, x: number, y: number) => void) {
  for (let iy = 0; iy < data.length; iy++) {
    for (let ix = 0; ix < data[0].length; ix++) {
      callback(data[iy][ix], ix, iy);
    }
  }
}

export default function iterateGrid(data: number[][], callback: (x: number, y: number, color: number) => void) {
  for (let iy = 0; iy < data.length; iy++) {
    for (let ix = 0; ix < data[0].length; ix++) {
      callback(ix, iy, data[iy][ix]);
    }
  }
}

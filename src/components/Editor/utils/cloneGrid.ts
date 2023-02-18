
/**
 * Copy array to new array instance.
 *
 * @param data 2d
 * @returns cloned matrix
 */
export default function cloneGrid(data: number[][]) {
  const newData: number[][] = [];
  for (let iy = 0; iy < data.length; iy++) {
    newData.push([]);
    for (let ix = 0; ix < data[0].length; ix++) {
      newData[iy].push(data[iy][ix]);
    }
  }
  return newData;
}

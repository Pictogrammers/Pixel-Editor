/**
 * Get a difference between 2d arrays.
 *
 * @param oldData Before the change.
 * @param newData After the change.
 * @returns list of changes [[x, y, color], ...]
 */
export default function diffGrid(oldData: number[][], newData: number[][]): number[][] {
    const changes = [];
    // Loop the larger grid
    const oldWidth = oldData[0].length;
    const oldHeight = oldData.length;
    const newWidth = newData[0].length;
    const newHeight = newData.length;
    const width = Math.max(oldWidth, newWidth);
    const height = Math.max(oldHeight, newHeight);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const newColor = newData && newData[y] && newData[y][x];
            const oldColor = oldData && oldData[y] && oldData[y][x];
            if (newColor === oldColor) { continue; }
            changes.push([x, y, oldColor, newColor]);
        }
    }
    return changes;
}

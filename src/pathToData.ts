export function pathToData(path: string, width: number, height: number) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    const path1 = new Path2D(path);
    ctx?.fill(path1);
    const data: number[][] = [];
    for (let y = 0; y < height; y++) {
        data.push([]);
        for (let x = 0; x < width; x++) {
            const pixel = ctx?.getImageData(x, y, 1, 1);
            const color = pixel?.data[3] === 255 ? 1 : 0;
            data[y].push(color);
        }
    }
    return data;
}
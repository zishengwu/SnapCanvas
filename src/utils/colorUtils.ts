export function getAverageColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): string {
  if (width <= 0 || height <= 0) return '#ffffff';
  
  const imageData = ctx.getImageData(x, y, Math.min(width, ctx.canvas.width - x), Math.min(height, ctx.canvas.height - y));
  const data = imageData.data;
  
  const step = Math.max(1, Math.floor(Math.min(width, height) / 60));
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let row = 0; row < height; row += step) {
    for (let col = 0; col < width; col += step) {
      const index = (row * width + col) * 4;
      if (index < data.length - 3) {
        r += data[index];
        g += data[index + 1];
        b += data[index + 2];
        count++;
      }
    }
  }
  
  if (count === 0) return '#ffffff';
  
  return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
}

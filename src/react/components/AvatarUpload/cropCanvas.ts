/** Preview canvas size (px) and the radius of the circular crop inside it. Output is a 256×256 PNG. */
export const CANVAS_SIZE = 320;
export const CROP_RADIUS = 128;

export interface CropState {
  zoom: number;
  offset: { x: number; y: number };
}

/** Where the image sits on the preview canvas: "cover" scaling × zoom, centred, then dragged by `offset`. */
function placement(img: HTMLImageElement, { zoom, offset }: CropState) {
  const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height) * zoom;
  const w = img.width * scale;
  const h = img.height * scale;
  return { w, h, x: (CANVAS_SIZE - w) / 2 + offset.x, y: (CANVAS_SIZE - h) / 2 + offset.y };
}

function circle(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2);
}

/** Draws the preview: the image inside the circle, a dimmed outside, and a light ring. */
export function drawPreview(ctx: CanvasRenderingContext2D, img: HTMLImageElement, state: CropState) {
  const { x, y, w, h } = placement(img, state);
  const c = CANVAS_SIZE / 2;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.globalCompositeOperation = 'destination-out';
  circle(ctx, c, c);
  ctx.fill();
  ctx.restore();

  ctx.save();
  circle(ctx, c, c);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  circle(ctx, c, c);
  ctx.stroke();
}

/** Exports exactly what the circle shows as a transparent-cornered 256×256 PNG. */
export function exportCrop(img: HTMLImageElement, state: CropState): Promise<Blob | null> {
  const out = document.createElement('canvas');
  out.width = CROP_RADIUS * 2;
  out.height = CROP_RADIUS * 2;
  const ctx = out.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  const { x, y, w, h } = placement(img, state);
  const shift = CANVAS_SIZE / 2 - CROP_RADIUS;
  circle(ctx, CROP_RADIUS, CROP_RADIUS);
  ctx.clip();
  ctx.drawImage(img, x - shift, y - shift, w, h);
  return new Promise((resolve) => out.toBlob(resolve, 'image/png'));
}

// Renders the print-grain tile used by `.grain` (src/assets/grain.png). The noise is the same
// feTurbulence the site used to render live in CSS, baked into black pixels whose alpha equals
// what `mix-blend-mode: multiply` at 16% opacity would have darkened, so the page needs neither the
// filter nor the blend mode. Run: docker compose run --rm dev node scripts/make-grain.mjs
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const SIZE = Number(process.argv[2] ?? 180);
const LEVELS = Number(process.argv[3] ?? 8);
const OPACITY = 0.16;
const out = process.argv[4] ?? 'src/assets/grain.png';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
const { pixels } = new Resvg(svg).render();

const darkness = new Float64Array(SIZE * SIZE);
for (let i = 0; i < SIZE * SIZE; i++) {
  const [r, g, b, a] = pixels.subarray(i * 4, i * 4 + 4);
  // resvg returns premultiplied RGBA: unpremultiply to get the gray level.
  const alpha = a / 255;
  const gray = alpha > 0 ? (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 / alpha : 1;
  darkness[i] = Math.min(Math.max(OPACITY * alpha * (1 - gray) * 255, 0), 255);
}

// Quantize to a few alpha levels across the range actually used, so the PNG fits a tiny palette.
const max = darkness.reduce((a, b) => Math.max(a, b), 0);
if (max === 0) throw new Error('Rendered noise is empty; nothing to write.');
const rgba = Buffer.alloc(SIZE * SIZE * 4);
darkness.forEach((d, i) => {
  rgba[i * 4 + 3] = Math.round(Math.round((d / max) * (LEVELS - 1)) * (max / (LEVELS - 1)));
});

await sharp(rgba, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .png({ palette: true, colours: LEVELS, compressionLevel: 9, effort: 10, dither: 0 })
  .toFile(out);
console.log(`Wrote ${out}`);

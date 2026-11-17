// Per-post link-preview images (1200×630 PNG), rendered at build time: Satori lays out the design
// as SVG and resvg turns it into a PNG. Matches the section preview images in src/assets/og/.
// Satori can't read WOFF2 or variable fonts, so static WOFF copies of Libre Franklin live in
// src/assets/fonts/og/ (SIL Open Font License, see OFL.txt there).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const root = process.cwd();
const asset = (path) => readFileSync(join(root, 'src/assets', path));
const font = (weight) => ({
  name: 'Libre Franklin',
  data: asset(`fonts/og/libre-franklin-latin-${weight}-normal.woff`),
  weight,
  style: 'normal',
});

let fonts;
let grain;

const COLORS = {
  ink: '#141414',
  paper: '#f2ede4',
  red: '#ea4b35',
  blue: '#1e4fa6',
  yellow: '#f4c12b',
};

// Per-section field color, text colors and art (same shapes and viewBox as SectionArt.astro).
const SECTIONS = {
  thoughts: {
    label: 'Thoughts',
    field: COLORS.yellow,
    text: COLORS.ink,
    muted: '#4a3a0c',
    art: [
      ['path', { d: 'M78 92c-6-30 26-50 50-36 16-22 56-14 58 16 26 4 30 44 6 56 6 28-26 46-48 30-16 22-54 18-62-8-28 2-40-38-4-58Z', fill: COLORS.ink }],
      ['circle', { cx: 138, cy: 108, r: 20, fill: COLORS.red }],
      ['circle', { cx: 58, cy: 164, r: 15, fill: COLORS.blue }],
      ['circle', { cx: 30, cy: 190, r: 9, fill: COLORS.blue }],
    ],
  },
};

const h = (type, style, children = []) => ({ type, props: { style, children } });

const titleSize = (title) => (title.length <= 28 ? 88 : title.length <= 52 ? 76 : 60);

/** @param {{ section: keyof typeof SECTIONS, title: string, date?: string }} options */
export async function renderOgImage({ section, title, date }) {
  const theme = SECTIONS[section];
  fonts ??= [font(500), font(700), font(800)];
  grain ??= `data:image/png;base64,${asset('og/grain.png').toString('base64')}`;

  const art = {
    type: 'svg',
    props: {
      width: 560,
      height: 560,
      viewBox: '0 0 200 200',
      style: { position: 'absolute', right: -10, bottom: -40 },
      children: theme.art.map(([type, attrs]) => ({ type, props: attrs })),
    },
  };

  const grainTiles = [];
  for (let y = 0; y < 630; y += 300) {
    for (let x = 0; x < 1200; x += 300) {
      grainTiles.push({
        type: 'img',
        props: { src: grain, width: 300, height: 300, style: { position: 'absolute', left: x, top: y } },
      });
    }
  }

  // Everything is absolutely positioned so the art and grain don't take part in the flex layout.
  const content = h(
    'div',
    {
      position: 'absolute',
      top: 64,
      left: 64,
      // Satori sizes boxes without their padding, so the inset is set by position and size instead.
      width: 1200 - 64 * 2,
      height: 630 - 64 - 60,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    [
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { display: 'flex', fontSize: 21, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }, [
          `Cameron Williams · ${theme.label}`,
        ]),
        h(
          'div',
          {
            display: 'flex',
            marginTop: 56,
            maxWidth: 780,
            fontSize: titleSize(title),
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: '-0.035em',
          },
          [title],
        ),
        ...(date ? [h('div', { display: 'flex', marginTop: 28, fontSize: 30, fontWeight: 500, color: theme.muted }, [date])] : []),
      ]),
      h('div', { display: 'flex', fontSize: 22, fontWeight: 700 }, ['cameronwillia.ms']),
    ],
  );

  const grainLayer = h('div', { position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex' }, grainTiles);

  const tree = h(
    'div',
    {
      position: 'relative',
      display: 'flex',
      width: 1200,
      height: 630,
      background: theme.field,
      color: theme.text,
      fontFamily: 'Libre Franklin',
      overflow: 'hidden',
    },
    [art, content, grainLayer],
  );

  const svg = await satori(tree, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

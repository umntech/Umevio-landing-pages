/**
 * Builds the /ai-video share card once, to a committed PNG.
 *
 * Why not Next's opengraph-image.tsx convention: Next 14's bundled @vercel/og
 * does `path.join(import.meta.url, ...)` on a file:// URL, which Windows mangles
 * into a backslash path, so `next build` crashes on any Windows machine. It
 * would work on Vercel's Linux runners, but a build that only passes on the
 * server is not a build gate. So the card is rasterised here, checked in, and
 * served as a plain static asset.
 *
 * Why pango text layers rather than one SVG: sharp rasterises SVG through
 * librsvg, which ignores @font-face data URIs and silently falls back to a
 * system serif — the first attempt came out in the wrong typeface entirely.
 * sharp's text input takes a fontfile directly, so each line is rendered in the
 * real brand face and composited.
 *
* This is a LOCAL AUTHORING TOOL, not part of the build. Its inputs live under
 * public/images/brand/, which .gitignore excludes, so it will not run on a fresh
 * clone or on Vercel — only the committed PNG output ships. That is fine; the
 * card only needs rebuilding when the headline or brand changes.
 *
 * Note on the font files: public/images/brand/fonts/ shipped with the two DM
 * Serif Display faces swapped — the file named -Regular.ttf held the Italic and
 * vice versa. They were renamed to match their internal name tables on
 * 2026-08-24. If a fresh copy of the brand assets is ever dropped in, check
 * this again: the first render of this card came out entirely in italic.
 *
 * Run:  node scripts/build-og-image.cjs
 * Re-run only if the headline or the brand changes.
 *
 * GUARDRAIL: no invented numbers. This card carries none at all.
 */
const path = require('path');
const sharp = require('sharp');

const W = 1200;
const H = 630;
const FONTS = path.join(__dirname, '..', 'public', 'images', 'brand', 'fonts');
const OUT = path.join(__dirname, '..', 'public', 'images', 'ai-video', 'og.png');

const SERIF = { file: path.join(FONTS, 'DMSerifDisplay-Regular.ttf'), family: 'DM Serif Display' };
const SANS = { file: path.join(FONTS, 'Outfit-Regular.ttf'), family: 'Outfit' };
const SANS_MED = { file: path.join(FONTS, 'Outfit-Medium.ttf'), family: 'Outfit Medium' };

/* dpi 72 makes one pango point equal one CSS pixel, so sizes here read the same
   as the sizes in the component. */
const layer = ({ markup, font, width }) =>
  sharp({
    text: { text: markup, font: font.family, fontfile: font.file, rgba: true, dpi: 72, width },
  })
    .png()
    .toBuffer();

async function main() {
  /* Background: flat warm-dark plus the same rouge bloom the hero uses. No text
     in the SVG, so librsvg's font handling never comes into it. */
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="g" cx="16%" cy="-6%" r="72%">
        <stop offset="0%" stop-color="#D94F3D" stop-opacity="0.26"/>
        <stop offset="60%" stop-color="#D94F3D" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#1C1208" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#1C1208"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <circle cx="86" cy="78" r="6" fill="#D94F3D"/>
    <rect x="80" y="548" width="1040" height="1" fill="#F0E9DF" fill-opacity="0.12"/>
  </svg>`);

  const [eyebrow, h1a, h1b, body, mark, url] = await Promise.all([
    layer({
      markup: `<span foreground="#E2654F" letter_spacing="4600" size="20pt">AI VIDEO CONTENT ENGINE</span>`,
      font: SANS_MED,
    }),
    layer({ markup: `<span foreground="#FAF6F0" size="92pt" style="normal" weight="400">Record once.</span>`, font: SERIF }),
    layer({
      markup: `<span foreground="#FAF6F0" size="92pt" style="normal" weight="400">Post <span foreground="#D94F3D">every day</span>.</span>`,
      font: SERIF,
    }),
    layer({
      markup: `<span foreground="#A89880" size="26pt" line_height="1.45">Fifteen minutes of recording, once. Scripts written,\nvideos edited, every one labelled as AI.</span>`,
      font: SANS,
    }),
    layer({
      markup: `<span foreground="#FAF6F0" size="34pt" style="normal" weight="400">ume<span foreground="#D94F3D">vio</span></span>`,
      font: SERIF,
    }),
    layer({ markup: `<span foreground="#8A7660" size="20pt">ads.umevio.com/ai-video</span>`, font: SANS }),
  ]);

  const urlMeta = await sharp(url).metadata();

  const info = await sharp(bg)
    .composite([
      { input: eyebrow, left: 108, top: 68 },
      { input: h1a, left: 80, top: 196 },
      { input: h1b, left: 80, top: 302 },
      { input: body, left: 82, top: 438 },
      { input: mark, left: 80, top: 566 },
      { input: url, left: W - 80 - (urlMeta.width || 0), top: 576 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  console.log(`wrote ${OUT} — ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
}

main().catch((e) => { console.error(e); process.exit(1); });

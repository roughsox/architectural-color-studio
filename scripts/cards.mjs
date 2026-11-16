// Renders every Trio swatch card to the image people download, measures it, and refuses any card that
// does not show its stated colours. Run with `npm run cards` after changing a trio or site/card.mjs;
// the build stops until the cards match the current data.
//
// Checks on the delivered JPEG, per swatch (text area excluded):
//   - average colour within 1.0 CIEDE2000 of the stated value (about the smallest difference a person can see);
//   - visible texture (lightness varies by at least 1 standard deviation), so the fix is not "remove the texture";
//   - the name at least 3:1 against the swatch (large lettering), the finish label at least 4.5:1.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARD, trioCardSvg, bandOf, textBox, lab, deltaE00, hexOf, foilFor, contrast, LEGIBLE } from '../site/card.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const SCALE = 2.4; // 450 × 1000 drawing → 1080 × 2400 image
export function cardSourceHash(trios) {
  const h = createHash('sha256');
  h.update(JSON.stringify(trios.combinations.map(c => ({ number: c.number, name: c.name, colours: c.colours }))));
  h.update(readFileSync(join(root, 'site', 'card.mjs')));
  h.update(readFileSync(join(root, 'site', 'fonts', 'bodoni-moda-500.woff2')));
  h.update(String(SCALE));
  return h.digest('hex').slice(0, 16);
}
export const cardFile = c => `trio-${c.number}-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.jpg`;

if (import.meta.url === `file://${process.argv[1]}`) {
  const { chromium } = createRequire(import.meta.url)('playwright'); // only needed to render, not to build
  const trios = JSON.parse(readFileSync(join(root, 'studio', 'palettes', 'trios.json'), 'utf8'));
  const font = readFileSync(join(root, 'site', 'fonts', 'bodoni-moda-500.woff2')).toString('base64');
  const outDir = join(root, 'studio', 'palettes', 'trio-cards');
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: CARD.w, height: CARD.h }, deviceScaleFactor: SCALE });
  const manifest = { source: cardSourceHash(trios), size: `${CARD.w * SCALE}×${CARD.h * SCALE}`, checked: new Date().toISOString().slice(0, 10), cards: {} };
  const failures = [];
  for (const c of trios.combinations) {
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff">${trioCardSvg(c, { font, title: false }).replace('<svg ', `<svg width="${CARD.w}" height="${CARD.h}" `)}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: CARD.w, height: CARD.h } });
    writeFileSync(join(outDir, cardFile(c)), jpg);
    // Measure the delivered file, not the drawing.
    const bands = c.colours.map((_, i) => ({ ...bandOf(i), ...textBox(i) }));
    const stats = await page.evaluate(async ({ src, bands, scale }) => {
      const img = new Image(); img.src = src; await img.decode();
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
      const g = cv.getContext('2d', { colorSpace: 'srgb' }); g.drawImage(img, 0, 0);
      return bands.map(b => {
        const m = 8 * scale, x0 = Math.round(m), x1 = Math.round(img.width - m), rows = [];
        for (let y = Math.round(b.y * scale + m); y < Math.round((b.y + b.h) * scale - m); y++) if (y < b.y0 * scale || y > b.y1 * scale) rows.push(y);
        let r = 0, gg = 0, bl = 0, n = 0; const lum = [];
        for (const y of rows) { const d = g.getImageData(x0, y, x1 - x0, 1).data; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bl += d[i + 2]; n++; if ((i >> 2) % 7 === 0) lum.push([d[i], d[i + 1], d[i + 2]]); } }
        return { mean: [r / n, gg / n, bl / n], sample: lum.filter((_, k) => k % 5 === 0) };
      });
    }, { src: 'data:image/jpeg;base64,' + jpg.toString('base64'), bands, scale: SCALE });
    manifest.cards[c.number] = { file: cardFile(c), swatches: c.colours.map((x, i) => {
      const L = stats[i].sample.map(p => lab(p)[0]), avg = L.reduce((a, v) => a + v, 0) / L.length;
      const sd = Math.sqrt(L.reduce((a, v) => a + (v - avg) ** 2, 0) / L.length);
      const rendered = hexOf(stats[i].mean), dE = deltaE00(lab(x.hex), lab(stats[i].mean)), foil = foilFor(x.hex, LEGIBLE.name), cr = contrast(foil, x.hex), lfoil = foilFor(x.hex, LEGIBLE.label), lcr = contrast(lfoil, x.hex);
      if (dE > 1.0) failures.push(`Trio ${c.number} ${x.name}: renders ${rendered}, ${dE.toFixed(2)} from ${x.hex} (limit 1.0)`);
      if (sd < 1.0) failures.push(`Trio ${c.number} ${x.name}: texture too faint (lightness spread ${sd.toFixed(2)}, minimum 1.0)`);
      if (cr < LEGIBLE.name) failures.push(`Trio ${c.number} ${x.name}: name contrast ${cr.toFixed(2)}:1 (minimum ${LEGIBLE.name})`);
      if (lcr < LEGIBLE.label) failures.push(`Trio ${c.number} ${x.name}: finish label contrast ${lcr.toFixed(2)}:1 (minimum ${LEGIBLE.label})`);
      return { name: x.name, finish: x.finish, stated: x.hex, rendered, deltaE00: +dE.toFixed(2), texture: +sd.toFixed(2), lettering: foil, contrast: +cr.toFixed(2), label: lfoil, labelContrast: +lcr.toFixed(2) };
    }) };
    for (const s of manifest.cards[c.number].swatches) console.log(`Trio ${c.number} ${s.name.padEnd(10)} ${s.finish.padEnd(8)} stated ${s.stated} rendered ${s.rendered}  ΔE00 ${s.deltaE00.toFixed(2)}  texture ${s.texture.toFixed(2)}  name ${s.lettering} ${s.contrast.toFixed(1)}:1  label ${s.label} ${s.labelContrast.toFixed(1)}:1`);
  }
  await browser.close();
  if (failures.length) { console.error('\nCards refused:\n  ' + failures.join('\n  ')); process.exit(1); }
  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
  console.log(`\nAll ${trios.combinations.length} cards pass. Written to studio/palettes/trio-cards/.`);
}

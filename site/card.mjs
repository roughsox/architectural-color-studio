// The palette card, drawn as one SVG: three flat swatches with the same fine paper grain and the colour names only.
// No finishes, no roles: the card shows a palette, not which object gets which colour (owner, 2026-11-16).
// The same drawing is shown on the site and rendered to the downloadable card image (scripts/cards.mjs),
// so what the owner sees, what the image maker is given and what gets posted are the same picture.
//
// Colour rule: the grain is a pair of layers, one a little lighter and one a little darker than the swatch by the same
// amount, covering equal shares of it. They cancel out, so each swatch still averages to its stated colour.
// scripts/cards.mjs measures the rendered card and refuses it if any swatch drifts.

export const CARD = { w: 360, h: 450 }; // 4:5, the post's second slide; rendered at 1080 × 1350
export const FONT_FAMILY = 'ACS Bodoni';

// ---- colour maths (sRGB, CIE Lab D65, CIEDE2000, WCAG contrast)
const ch = (hex, i) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
export const rgbOf = hex => [0, 1, 2].map(i => ch(hex, i));
export const hexOf = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const lin = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
export function lab(rgb) {
  const [r, g, b] = (typeof rgb === 'string' ? rgbOf(rgb) : rgb).map(lin);
  const q = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const X = q((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047), Y = q(0.2126729 * r + 0.7151522 * g + 0.0721750 * b), Z = q((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
export function deltaE00([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180, C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const hp = (b, a) => (a === 0 && b === 0) ? 0 : (Math.atan2(b, a) / rad + 360) % 360;
  const h1 = hp(b1, a1p), h2 = hp(b2, a2p);
  let dh = h2 - h1; if (C1p * C2p === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dL = L2 - L1, dC = C2p - C1p, dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(dh / 2 * rad);
  const Lb = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hb = h1 + h2; if (C1p * C2p !== 0) hb = Math.abs(h1 - h2) > 180 ? (h1 + h2 + (h1 + h2 < 360 ? 360 : -360)) / 2 : (h1 + h2) / 2;
  const T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad) - 0.20 * Math.cos((4 * hb - 63) * rad);
  const Sl = 1 + 0.015 * (Lb - 50) ** 2 / Math.sqrt(20 + (Lb - 50) ** 2), Sc = 1 + 0.045 * Cbp, Sh = 1 + 0.015 * Cbp * T;
  const Rt = -2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hb - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh));
}
const luminance = hex => { const [r, g, b] = rgbOf(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (x, y) => { const [a, b] = [luminance(x), luminance(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };

// ---- the foil: gold where gold reads, deepened or paled only as far as legibility needs.
// Names are large lettering, so they need 3:1 (the standard for large text).
export const LEGIBLE = { name: 3, label: 4.5 };
const FOIL = { deep: '#2E2010', gold: '#C9A45C', pale: '#F6EBCB' };
const mix = (a, b, t) => hexOf(rgbOf(a).map((v, i) => v + (rgbOf(b)[i] - v) * t));
export function foilFor(bg, min = 4.5) {
  // t from -1 (deep bronze) through 0 (gold) to 1 (pale gold), then on to 2 (near white) only if pale gold is still not legible.
  const ramp = t => t < 0 ? mix(FOIL.gold, FOIL.deep, -t) : t <= 1 ? mix(FOIL.gold, FOIL.pale, t) : mix(FOIL.pale, '#FFFDF6', t - 1);
  let best = null;
  search: for (let k = 0; k <= 200; k++) for (const s of [1, -1]) { // step outward from gold; the first hit is the nearest
    if (s < 0 && k > 100) continue;
    const c = ramp(s * k / 100);
    if (contrast(c, bg) >= min) { best = c; break search; }
  }
  if (!best) best = contrast(FOIL.pale, bg) > contrast(FOIL.deep, bg) ? FOIL.pale : FOIL.deep;
  return best;
}

// ---- the grain: identical on every swatch, so it suggests paper without suggesting any material
function pair(hex, want = 14) {
  const rgb = rgbOf(hex), d = Math.min(want, ...rgb, ...rgb.map(v => 255 - v));
  return { hi: rgb.map(v => v + d), lo: rgb.map(v => v - d) };
}
const n3 = v => (v / 255).toFixed(4);
// Where the noise is above its midpoint the lighter colour shows, below it the darker one, equally. Drawn twice, the
// second copy mirrored with lighter and darker swapped, so any small tint from the noise over a small area cancels.
function grainFilter(id, box, p, swap = false) {
  const [hr, hg, hb] = (swap ? p.lo : p.hi).map(n3), [lr, lg, lb] = (swap ? p.hi : p.lo).map(n3), k = 1.6;
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/>`
    + `<feColorMatrix in="n" type="matrix" values="0 0 0 0 ${hr} 0 0 0 0 ${hg} 0 0 0 0 ${hb} ${k} 0 0 0 ${-k / 2}" result="h"/>`
    + `<feColorMatrix in="n" type="matrix" values="0 0 0 0 ${lr} 0 0 0 0 ${lg} 0 0 0 0 ${lb} ${-k} 0 0 0 ${k / 2}" result="l"/>`
    + `<feMerge><feMergeNode in="h"/><feMergeNode in="l"/></feMerge></filter>`;
}

// ---- the card
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function nameSize(name) { return Math.min(18, Math.floor(300 / (name.length * 1.04))); } // Bodoni capitals ~0.72em wide + 0.32em tracking
export function bandOf(i) { const h = CARD.h / 3; return { x: 0, y: Math.round(i * h), w: CARD.w, h: Math.round((i + 1) * h) - Math.round(i * h) }; }
export const textBox = i => { const b = bandOf(i), cy = b.y + b.h / 2; return { y0: cy - 16, y1: cy + 10 }; };

export function trioCardSvg(trio, { id = 'c' + trio.number, font = null, cls = '', title = true } = {}) {
  const defs = [], body = [];
  if (font) defs.push(`<style>@font-face{font-family:'${FONT_FAMILY}';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:500}</style>`);
  trio.colours.forEach((x, i) => {
    const box = bandOf(i), p = pair(x.hex), foil = foilFor(x.hex, LEGIBLE.name), pre = `${id}-${i}`;
    const flip = `translate(0 ${2 * box.y + box.h}) scale(1 -1)`, r = `x="0" y="${box.y}" width="${box.w}" height="${box.h}"`;
    defs.push(grainFilter(`${pre}-a`, box, p), grainFilter(`${pre}-b`, box, p, true));
    body.push(`<rect ${r} fill="${x.hex}"/>`, `<rect ${r} filter="url(#${pre}-a)"/>`, `<rect ${r} transform="${flip}" filter="url(#${pre}-b)"/>`);
    const fs = nameSize(x.name), cy = box.y + box.h / 2;
    body.push(`<text x="${CARD.w / 2 + fs * 0.16}" y="${cy + fs * 0.35}" text-anchor="middle" font-family="'${FONT_FAMILY}',Didot,'Bodoni 72',Georgia,serif" font-weight="500" font-size="${fs}" letter-spacing="${(fs * 0.32).toFixed(1)}" fill="${foil}">${esc(x.name.toUpperCase())}</text>`);
  });
  const label = trio.colours.map(x => `${x.name} ${x.hex}`).join(', ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD.w} ${CARD.h}"${cls ? ` class="${cls}"` : ''} role="img" aria-label="${esc(trio.name)} palette: ${esc(label)}">`
    + (title ? `<title>${esc(trio.name)}</title>` : '') + `<defs>${defs.join('')}</defs>${body.join('')}</svg>`;
}

// The Trio swatch card, drawn as one SVG.
// The same drawing is shown on the site and rendered to the downloadable card image (scripts/cards.mjs),
// so what the owner sees, what the image maker is given and what gets posted are the same picture.
//
// Colour rule: every texture is a pair of layers, one a little lighter and one a little darker than the swatch
// by the same amount, covering equal shares of it. They cancel out, so each swatch still averages to its
// stated colour. scripts/cards.mjs measures the rendered card and refuses it if any swatch drifts.

export const CARD = { w: 450, h: 1000 };
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
// Names are large lettering, so they need 3:1 (the standard for large text); the small finish labels need 4.5:1.
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

// ---- textures
const TEXTURE = { lacquer: 'lacquer', plaster: 'plaster', limewash: 'plaster', paint: 'plaster', leather: 'leather', velvet: 'velvet', linen: 'linen', boucle: 'boucle' };
export const textureOf = finish => TEXTURE[finish] || 'plaster';
// Lighter and darker versions of the swatch, the same distance either side (capped so neither leaves the colour range).
function pair(hex, want = 34) {
  const rgb = rgbOf(hex), d = Math.min(want, ...rgb, ...rgb.map(v => 255 - v));
  return { hi: rgb.map(v => v + d), lo: rgb.map(v => v - d) };
}
const n3 = v => (v / 255).toFixed(4);
// Noise filter: where the noise is above its midpoint, the lighter colour shows; below it, the darker one, equally.
// Over a small swatch, broad noise does not average exactly to its midpoint, which would tint the swatch.
// So each noise layer is drawn twice: once as is, and once mirrored top to bottom with lighter and darker swapped.
// The mirrored copy has the same average but the opposite sign, so any tint cancels; the pattern itself does not.
function noiseFilter(id, box, p, { freq, oct, seed, k }, swap = false) {
  const [hr, hg, hb] = (swap ? p.lo : p.hi).map(n3), [lr, lg, lb] = (swap ? p.hi : p.lo).map(n3);
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" result="n"/>`
    + `<feColorMatrix in="n" type="matrix" values="0 0 0 0 ${hr} 0 0 0 0 ${hg} 0 0 0 0 ${hb} ${k} 0 0 0 ${-k / 2}" result="h"/>`
    + `<feColorMatrix in="n" type="matrix" values="0 0 0 0 ${lr} 0 0 0 0 ${lg} 0 0 0 0 ${lb} ${-k} 0 0 0 ${k / 2}" result="l"/>`
    + `<feMerge><feMergeNode in="h"/><feMergeNode in="l"/></feMerge></filter>`;
}
// Sheen: a gradient whose lighter and darker halves mirror each other, so they cancel over the swatch.
function sheen(id, p, stops, angle) {
  const rad = angle * Math.PI / 180, x = Math.cos(rad) / 2, y = Math.sin(rad) / 2;
  const half = stops.map(([o, a]) => `<stop offset="${o}" stop-color="${hexOf(p.hi)}" stop-opacity="${a}"/>`);
  const mirror = stops.slice().reverse().map(([o, a]) => `<stop offset="${(1 - o).toFixed(3)}" stop-color="${hexOf(p.lo)}" stop-opacity="${a}"/>`);
  return `<linearGradient id="${id}" x1="${0.5 - x}" y1="${0.5 - y}" x2="${0.5 + x}" y2="${0.5 + y}">${half.join('')}${mirror.join('')}</linearGradient>`;
}
const LAYERS = {
  plaster: [{ noise: { freq: 0.006, oct: 4, seed: 2, k: 2.4 } }, { noise: { freq: 0.6, oct: 2, seed: 7, k: 0.9 } }],
  leather: [{ noise: { freq: 0.02, oct: 3, seed: 9, k: 1.8 } }, { noise: { freq: 0.75, oct: 2, seed: 4, k: 1.6 } }],
  velvet: [{ sheen: { stops: [[0, 0.55], [0.4, 0]], angle: 65 } }, { noise: { freq: 0.9, oct: 1, seed: 5, k: 0.7 } }],
  lacquer: [{ sheen: { stops: [[0, 0.6], [0.28, 0], [0.36, 0], [0.4, 0.3], [0.44, 0]], angle: 70 } }, { noise: { freq: 0.012, oct: 2, seed: 3, k: 0.7 } }],
  linen: [{ weave: true }, { noise: { freq: 0.45, oct: 2, seed: 11, k: 0.9 } }],
  boucle: [{ noise: { freq: 0.18, oct: 2, seed: 13, k: 2.2 } }, { noise: { freq: 0.7, oct: 1, seed: 6, k: 1.0 } }],
};

// ---- the card
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function nameSize(name) { return Math.min(32, Math.floor(370 / (name.length * 1.04))); } // Bodoni capitals ~0.72em wide + 0.32em tracking
export function bandOf(i) { const h = CARD.h / 3; return { x: 0, y: Math.round(i * h), w: CARD.w, h: Math.round((i + 1) * h) - Math.round(i * h) }; }
export const textBox = i => { const b = bandOf(i), cy = b.y + b.h / 2; return { y0: cy - 46, y1: cy + 34 }; };

export function trioCardSvg(trio, { id = 'c' + trio.number, font = null, cls = '', title = true } = {}) {
  const defs = [], body = [];
  if (font) defs.push(`<style>@font-face{font-family:'${FONT_FAMILY}';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:500}</style>`);
  trio.colours.forEach((x, i) => {
    const box = bandOf(i), p = pair(x.hex), t = textureOf(x.finish), foil = foilFor(x.hex, LEGIBLE.name), foilLabel = foilFor(x.hex, LEGIBLE.label), pre = `${id}-${i}`;
    body.push(`<rect x="0" y="${box.y}" width="${box.w}" height="${box.h}" fill="${x.hex}"/>`);
    LAYERS[t].forEach((L, j) => {
      if (L.noise) {
        const half = { ...L.noise, k: L.noise.k * 0.75 }, flip = `translate(0 ${2 * box.y + box.h}) scale(1 -1)`;
        defs.push(noiseFilter(`${pre}-n${j}`, box, p, half), noiseFilter(`${pre}-m${j}`, box, p, half, true));
        body.push(`<rect x="0" y="${box.y}" width="${box.w}" height="${box.h}" filter="url(#${pre}-n${j})"/>`, `<rect x="0" y="${box.y}" width="${box.w}" height="${box.h}" transform="${flip}" filter="url(#${pre}-m${j})"/>`);
      }
      if (L.sheen) { defs.push(sheen(`${pre}-g${j}`, p, L.sheen.stops, L.sheen.angle)); body.push(`<rect x="0" y="${box.y}" width="${box.w}" height="${box.h}" fill="url(#${pre}-g${j})"/>`); }
      if (L.weave) {
        defs.push(`<pattern id="${pre}-w" width="4" height="4" patternUnits="userSpaceOnUse"><rect y="0" width="4" height="1" fill="${hexOf(p.hi)}" fill-opacity=".45"/><rect y="2" width="4" height="1" fill="${hexOf(p.lo)}" fill-opacity=".45"/><rect x="1" width="1" height="4" fill="${hexOf(p.hi)}" fill-opacity=".2"/><rect x="3" width="1" height="4" fill="${hexOf(p.lo)}" fill-opacity=".2"/></pattern>`);
        body.push(`<rect x="0" y="${box.y}" width="${box.w}" height="${box.h}" fill="url(#${pre}-w)"/>`);
      }
    });
    const cy = box.y + box.h / 2, fs = nameSize(x.name), name = esc(x.name.toUpperCase()), fin = esc(x.finish.toUpperCase());
    const light = contrast(foil, '#000000') > contrast(foil, '#FFFFFF'); // foil lighter than mid-grey?
    const emboss = (dy, o) => `<g transform="translate(0 ${dy})" opacity="${o}">`;
    const text = (fill, fillLabel = fill) => `<text x="${CARD.w / 2 + fs * 0.16}" y="${cy - 2}" text-anchor="middle" font-family="'${FONT_FAMILY}',Didot,'Bodoni 72',Georgia,serif" font-weight="500" font-size="${fs}" letter-spacing="${(fs * 0.32).toFixed(1)}" fill="${fill}">${name}</text>`
      + `<text x="${CARD.w / 2 + 2}" y="${cy + 26}" text-anchor="middle" font-family="'${FONT_FAMILY}',Didot,'Bodoni 72',Georgia,serif" font-weight="500" font-size="13" letter-spacing="3.6" fill="${fillLabel}">${fin}</text>`;
    // Engraving: a soft shadow below and a soft highlight above the foil lettering.
    body.push(emboss(1, light ? 0.45 : 0.3) + text(hexOf(p.lo.map(v => v * 0.6))) + '</g>');
    body.push(emboss(-1, light ? 0.18 : 0.35) + text(hexOf(p.hi.map(v => v + (255 - v) * 0.4))) + '</g>');
    body.push(text(foil, foilLabel));
  });
  const label = trio.colours.map(x => `${x.name} ${x.hex} (${x.role}, ${x.finish})`).join('; ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD.w} ${CARD.h}"${cls ? ` class="${cls}"` : ''} role="img" aria-label="${esc(trio.name)} swatch card: ${esc(label)}">`
    + (title ? `<title>${esc(trio.name)}</title>` : '') + `<defs>${defs.join('')}</defs>${body.join('')}</svg>`;
}

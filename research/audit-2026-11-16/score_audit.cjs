// Audit of the scheme score: how selective is it, and how stable is it when a material's colour moves within its own stated range?
const fs = require('fs'); const path = require('path');
const app = process.argv[2];
const SCHEME = new Function(fs.readFileSync(path.join(app, 'site/scheme.js'), 'utf8').replace(/if \(typeof module[^\n]*/, '') + ';return SCHEME')();
const J = f => JSON.parse(fs.readFileSync(path.join(app, 'studio/palettes', f), 'utf8'));
const studio = J('studio.json'), mats = J('materials.json').materials, wada = J('wada.json'), trios = J('trios.json');
const by = n => mats.find(m => m.name === n);
const mix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
const variant = (m, t) => ({ ...m, typical: t < 0 ? mix(m.typical, m.light, -t) : mix(m.typical, m.dark, t) });

let passAll = 0, total = 0, flips = 0, minScores = [];
const rows = [];
for (const c of studio.combinations) {
  const ms = c.materials.map(by); const base = SCHEME.score(c.colours, ms).score;
  // every surface x touch pair: what share clears 85?
  const ranked = SCHEME.rank(c.colours, mats); const ok = ranked.filter(r => r.s.score >= 85).length;
  // move each material halfway toward its own light and dark ends (a real piece of walnut or linen easily differs this much)
  let lo = base;
  for (const t0 of [-0.5, 0, 0.5]) for (const t1 of [-0.5, 0, 0.5]) lo = Math.min(lo, SCHEME.score(c.colours, [variant(ms[0], t0), variant(ms[1], t1)]).score);
  if (lo < 85) flips++; minScores.push(lo);
  rows.push([c.number, c.name, base, lo, ok, ranked.length]);
  total += ranked.length; passAll += ok;
}
console.log('No. name | published score | lowest score when each material moves halfway within its own range | pairs scoring 85+ of all pairs');
rows.forEach(r => console.log(String(r[0]).padStart(2), r[1].padEnd(22), String(r[2]).padStart(3), String(r[3]).padStart(4), '   ', r[4] + '/' + r[5]));
console.log('\nStudio palettes:', studio.combinations.length, '| fall below 85 under that shift:', flips, '| share of all material pairs that clear 85:', (100 * passAll / total).toFixed(1) + '%');

// Field = lightest colour? (the scoring infers this for palettes without roles; the owner's references say the hero is deep)
let lightestField = 0; for (const c of studio.combinations) { const L = c.colours.map(x => SCHEME.lab(x.hex).L); const f = c.colours.findIndex(x => x.role === 'Field'); if (L[f] === Math.max(...L)) lightestField++; }
console.log('Studio palettes whose Field is the lightest colour:', lightestField + '/' + studio.combinations.length);
const fieldL = studio.combinations.map(c => Math.round(SCHEME.lab(c.colours.find(x => x.role === 'Field').hex).L));
console.log('Field lightness: min', Math.min(...fieldL), 'median', fieldL.sort((a, b) => a - b)[fieldL.length >> 1], 'max', Math.max(...fieldL), '| trio hero lightness:', trios.combinations.map(c => Math.round(SCHEME.lab(c.colours[0].hex).L)).join(', '));

// Wada on the home page: roles are inferred. How do Wada palettes score with their best material pair?
const best = wada.combinations.map(c => SCHEME.rank(c.colours, mats)[0].s.score);
console.log('Wada (348): best achievable score 85+:', best.filter(s => s >= 85).length, '| 70-84:', best.filter(s => s >= 70 && s < 85).length, '| under 70:', best.filter(s => s < 70).length);

// Do the studio's own palette rules pass the Wada book? (two to four colours, lightness gap 30, every pair 15 apart, one loud colour)
let fail = { gap: 0, close: 0, loud: 0, any: 0 };
for (const c of wada.combinations) { const m = c.colours.map(x => SCHEME.lab(x.hex)); const L = m.map(x => x.L); let bad = false;
  if (Math.max(...L) - Math.min(...L) < 30) { fail.gap++; bad = true; }
  let cl = false; for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) if (SCHEME.de(m[i], m[j]) < 15) cl = true; if (cl) { fail.close++; bad = true; }
  if (m.filter(x => x.C >= 45).length > 1) { fail.loud++; bad = true; }
  if (bad) fail.any++; }
console.log('Wada combinations that would be refused by the studio palette rules:', fail.any + '/348', JSON.stringify(fail));
// colour names carrying an object, finish or material word that the build check does not catch
const words = /\b(velvet|lacquer|plaster|limewash|wall|chair|sofa|lamp|throw|cushion|headboard|door|sill|pot|glaze|tile|azulejo|panel|gold leaf|paper|cream tea|denim)\b/i;
const hits = studio.combinations.flatMap(c => c.colours.filter(x => words.test(x.name)).map(x => x.name));
console.log('Studio colour names that still name an object or finish (' + hits.length + '):', hits.join(', '));

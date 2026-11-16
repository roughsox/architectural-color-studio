// Builds the public site from the plain files in studio/.
// Pages: Palettes, Guide, Current project (with desks), Library. Each has a plain-text or JSON twin for assistants.
import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { trioCardSvg } from './card.mjs';
import { cardSourceHash, cardFile } from '../scripts/cards.mjs';

const SITE = 'https://architectural-color-studio.vercel.app';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'studio');
const out = join(root, 'dist');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = t => marked.parse(t).replace(/<table>/g, '<div class="tablewrap"><table>').replace(/<\/table>/g, '</table></div>');
const write = (path, text) => { const f = join(out, path); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); };

function parse(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = {};
  if (m) for (const line of m[1].split('\n')) { const kv = line.match(/^([a-z_]+):\s*(.+)$/); if (kv) meta[kv[1]] = kv[2].replace(/^"|"$/g, ''); }
  return { raw, meta, body: (m ? raw.slice(m[0].length) : raw).trim() };
}

const css = readFileSync(join(root, 'site', 'style.css'), 'utf8');
const nav = [['/', 'Home'], ['/palettes', 'Palettes'], ['/guide', 'Guide'], ['/project', 'Current project'], ['/library', 'Library'], ['/notebook', 'Notebook'], ['/instructions', 'Instructions']];

function page({ title, html, path, wide = false, twin }) {
  write(path === '/' ? 'index.html' : path.slice(1) + '.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Architectural Color Studio</title>
<meta name="description" content="Architectural Color Studio: rooms that show what a colour combination feels like to live in.">
<style>${css}</style></head><body>
<header><a class="brand" href="/">A<span>/</span>C <small>Architectural Color Studio</small></a>
<nav>${nav.map(([h, t]) => `<a href="${h}"${(h === path || path.startsWith(h + '/')) ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav></header>
<main${wide ? ' class="wide"' : ''}>${html}
${twin ? `<p class="twin">Plain-text version of this page: <a href="${twin}">${twin}</a></p>` : ''}</main>
<footer>Assistants: the whole project in one text file at <a href="/llms.txt">/llms.txt</a>.</footer>
</body></html>`);
}

const strip = (colours, cls = 'strip') => `<div class="${cls}">${colours.map(c => `<span style="background:${c.hex}"></span>`).join('')}</div>`;
const chips = colours => `<div class="chips">${colours.map(c => `<div class="chip"><span style="background:${c.hex}"></span><b>${esc(c.name)}</b><code>${c.hex}</code></div>`).join('')}</div>`;

// ---- data
const families = readdirSync(join(src, 'palettes')).filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(readFileSync(join(src, 'palettes', f), 'utf8'))).sort((a, b) => a.order - b.order);
const isCombos = f => f.kind === 'combinations';
const isMat = f => f.kind === 'materials';
const size = f => isCombos(f) ? f.combinations.length : isMat(f) ? f.materials.length : f.colours.length;
const countLabel = f => isCombos(f) ? (size(f) ? `${size(f)} ${size(f) === 1 ? 'combination' : 'combinations'}` : 'none yet') : isMat(f) ? `${size(f)} materials` : `${size(f)} single colours`;
const total = families.filter(isCombos).reduce((n, f) => n + size(f), 0);

// ---- Studio palettes: the studio's own rules (Guide §4), checked on every build. A broken palette stops the build.
const lab = hex => {
  const lin = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16)));
  const q = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const X = q((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047), Y = q(0.2126 * r + 0.7152 * g + 0.0722 * b), Z = q((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  const L = 116 * Y - 16, A = 500 * (X - Y), B = 200 * (Y - Z);
  return { L, a: A, b: B, C: Math.hypot(A, B) };
};
const ink = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#22302b' : '#fff'; };
const schemeSrc = readFileSync(join(root, 'site', 'scheme.js'), 'utf8');
const SCHEME = new Function(schemeSrc + ';return SCHEME')();
const MATERIALS = families.find(f => f.kind === 'materials')?.materials || [];
const RULES = { fieldWeightGap: 30, minDistance: 15, loud: 45 };
const roleOrder = ['Field', 'Weight', 'Accent', 'Bridge'];
const allColours = new Map(); // "family|name" -> hex, from every family
for (const f of families) for (const c of isCombos(f) ? f.combinations.flatMap(x => x.colours) : f.colours || []) if (f.id !== 'studio') allColours.set(`${f.id}|${c.name}`, c.hex.toUpperCase());
function checkStudio(c) {
  const fail = m => { throw new Error(`Studio No. ${c.number} (${c.name}): ${m}`); };
  if (!c.name || !c.intent) fail('needs a name and a one-sentence intent');
  if (c.colours.length < 2 || c.colours.length > 4) fail('needs two to four colours');
  for (const x of c.colours) {
    if (!roleOrder.includes(x.role)) fail(`${x.name} needs a role (${roleOrder.join(', ')})`);
    if (!/^#[0-9A-Fa-f]{6}$/.test(x.hex)) fail(`${x.name} needs a colour value like #A1B2C3`);
  }
  // A paint colour named after a material reads as an instruction to use that material (e.g. "Walnut Shadow" → a walnut wall).
  const materialWord = /\b(walnut|oak|slate|brick|stone|marble|granite|concrete|clay|terracotta|steel|iron|copper|brass|cedar|teak|pine|leather|linen|wool|jute|rattan|travertine|limestone|sandstone|quarry|tile|timber|wood|plank)\b/i;
  for (const x of c.colours) if (materialWord.test(x.name)) fail(`colour "${x.name}" is named after a material; paint colour names must not suggest one`);
  const names = c.colours.map(x => x.name.toLowerCase());
  if (new Set(names).size !== names.length) fail('two colours share a name');
  const by = r => c.colours.filter(x => x.role === r);
  if (by('Field').length !== 1 || by('Weight').length !== 1 || by('Accent').length > 1 || by('Bridge').length > 1) fail('needs one Field, one Weight, and at most one Accent and one Bridge');
  const m = c.colours.map(x => ({ ...x, ...lab(x.hex) }));
  const [field, weight] = ['Field', 'Weight'].map(r => m.find(x => x.role === r));
  if (Math.abs(field.L - weight.L) < RULES.fieldWeightGap) fail(`Field and Weight are only ${Math.round(Math.abs(field.L - weight.L))} apart in lightness (minimum ${RULES.fieldWeightGap})`);
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) {
    const d = Math.hypot(m[i].L - m[j].L, m[i].a - m[j].a, m[i].b - m[j].b);
    if (d < RULES.minDistance) fail(`${m[i].name} and ${m[j].name} are too alike (difference ${Math.round(d)}, minimum ${RULES.minDistance})`);
  }
  if (m.filter(x => x.C >= RULES.loud).length > 1) fail(`more than one loud colour (strength ${RULES.loud} or more)`);
  c.colours.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));
  c.measured = m.map(x => ({ name: x.name, lightness: Math.round(x.L), strength: Math.round(x.C) }));
  if (c.materials) {
    const mats = c.materials.map(n => MATERIALS.find(x => x.name === n) || fail(`material "${n}" is not in the Materials family`));
    if (mats.length !== 2 || SCHEME.kind(mats[0]) !== 'surface' || SCHEME.kind(mats[1]) !== 'touch') fail('needs two materials: a surface first, then a touch material');
    c.scheme = SCHEME.score(c.colours, mats);
    if (c.scheme.score < 85) fail(`materials score ${c.scheme.score} (minimum 85): ${c.scheme.bad.join('; ')}`);
    c.materialRanges = mats.map(x => ({ name: x.name, light: x.light, typical: x.typical, dark: x.dark, use: x.use }));
  }
}
families.find(f => f.id === 'studio')?.combinations.forEach(checkStudio);

// ---- Trios: three colours. Roles and finishes stay in the data for the checks below; pages and cards show only names and values.
const TRIO_ROLES = ['Hero', 'Upholstery', 'Neutral'];
const isTrio = f => f.format === 'trio';
function checkTrio(c) {
  const fail = m => { throw new Error(`Trio No. ${c.number} (${c.name}): ${m}`); };
  if (c.colours.length !== 3 || TRIO_ROLES.some((r, i) => c.colours[i].role !== r)) fail('needs exactly three colours in order: Hero, Upholstery, Neutral');
  for (const x of c.colours) if (!/^#[0-9A-Fa-f]{6}$/.test(x.hex) || !x.finish) fail(`${x.name} needs a colour value and a finish`);
  const [h, u, n] = c.colours.map(x => lab(x.hex));
  if (Math.abs(h.L - n.L) < 25) fail('hero and neutral need at least 25 points of lightness between them');
  const d = (p, q) => Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);
  if (d(h, u) < 20 || d(u, n) < 20 || d(h, n) < 20) fail('every pair of colours must differ by at least 20');
}
families.filter(isTrio).forEach(f => f.combinations.forEach(checkTrio));
// The swatch card is one SVG (site/card.mjs), shown inline and rendered to a downloadable image by `npm run cards`,
// which also measures it. The build stops if the rendered cards no longer match the trios or the card design.
const trioCard = (c, cls = '') => trioCardSvg(c, { id: 'c' + c.number + (cls ? 's' : ''), cls: 'tcard' + cls });
const trioFamily = families.find(isTrio);
if (trioFamily) {
  const dir = join(src, 'palettes', 'trio-cards'), mf = join(dir, 'manifest.json');
  const manifest = existsSync(mf) ? JSON.parse(readFileSync(mf, 'utf8')) : null;
  if (!manifest || manifest.source !== cardSourceHash(trioFamily)) throw new Error('Trio cards are out of date with the trios or the card design. Run `npm run cards` (it renders, measures and saves them), then build again.');
  mkdirSync(join(out, 'trios'), { recursive: true });
  for (const c of trioFamily.combinations) copyFileSync(join(dir, cardFile(c)), join(out, 'trios', cardFile(c)));
  copyFileSync(join(root, 'site', 'fonts', 'bodoni-moda-500.woff2'), (mkdirSync(join(out, 'fonts'), { recursive: true }), join(out, 'fonts', 'bodoni-moda-500.woff2')));
  trioFamily.cardChecks = manifest;
}
// Prompt v0.8 for trios. Built from the trio's room sheet, following OpenAI's own image-prompting guide
// (gpt-image-2 cookbook, 2026): label each attached image; scene, then subject, then details, then constraints, in short
// labelled parts; prompt it as a real photograph captured on location, and avoid words that imply staging or polish
// ("luxury", "magazine", "high-end"), which push it toward the glossy AI look. See the Notebook, "What others have found".
const TRIO_LIGHT = {
  golden: 'Warm lamplight from the lamps that are on, with soft daylight from the window.',
  daylight: 'Soft late-afternoon daylight from the window as the main light, the lamps on low. Whites stay white.',
};
const SHEET_PARTS = ['room', 'architecture', 'focal', 'furniture', 'objects', 'camera'];
const TRIO_PROMPT = c => {
  const [h, u, n] = c.colours;
  return `Image 1 is the colour card for this room. Top: ${h.name}, ${h.finish}, for the walls. Middle: ${u.name}, ${u.finish}, for the upholstered pieces. Bottom: ${n.name}, ${n.finish}, the soft neutral. Match these three colours exactly, in natural colour balance.

Create a photorealistic photograph of a real, lived-in home, taken on location.

Room: ${c.sheet.room}
Walls and architecture: ${c.sheet.architecture}
Focal wall: ${c.sheet.focal}
Furniture: ${c.sheet.furniture}
Objects: ${c.sheet.objects} Nothing else on any surface.
Light: ${TRIO_LIGHT[c.light || 'golden']}
Camera: ${c.sheet.camera}

It should feel honest and unstaged: real textures, slight everyday wear, natural colour balance. No cinematic lighting, no colour grading, no glamorization.
Leave out anything not described above. No people, text, logos or watermarks. Vertical 4:5.`;
};
for (const f of families.filter(isTrio)) for (const c of f.combinations) {
  const missing = SHEET_PARTS.filter(k => !c.sheet || !c.sheet[k]);
  if (missing.length) throw new Error(`Trio No. ${c.number} (${c.name}): its room sheet needs ${missing.join(', ')}`);
  if (!TRIO_LIGHT[c.light || 'golden']) throw new Error(`Trio No. ${c.number}: light must be ${Object.keys(TRIO_LIGHT).join(' or ')}`);
}
const desks = JSON.parse(readFileSync(join(src, 'desks.json'), 'utf8'));
const stages = ['Queued', 'Directed', 'Requested', 'Received', 'Reviewed', 'Approved', 'In the library'];
const guide = parse(join(src, 'guide', 'GUIDE.md'));

const projects = readdirSync(join(src, 'projects')).sort().map(id => {
  const dir = join(src, 'projects', id);
  const p = parse(join(dir, 'project.md'));
  const family = families.find(f => f.id === p.meta.family);
  const palette = family.combinations.find(c => c.number === Number(p.meta.palette));
  const nd = join(dir, 'notes');
  const notes = existsSync(nd) ? readdirSync(nd).filter(f => f.endsWith('.md')).sort().map(f => {
    const n = parse(join(nd, f));
    const expert = desks.find(d => d.id === n.meta.expert);
    if (!expert) throw new Error(`${id}/notes/${f}: unknown expert "${n.meta.expert}"`);
    return { ...n, expert };
  }) : [];
  const turnFile = join(dir, 'your-turn.md');
  const turn = existsSync(turnFile) ? parse(turnFile) : null;
  const opt = f => existsSync(join(dir, f)) ? parse(join(dir, f)) : null;
  return { id, ...p, family, palette, notes, turn, sitdown: opt('sit-down.md'), prompt: opt('prompt.md'), next: desks.find(d => d.id === p.meta.next) };
});
const current = projects.filter(p => p.meta.stage !== 'In the library').pop();
const approved = projects.filter(p => p.meta.stage === 'In the library');
const statusOf = (f, n) => projects.find(p => p.family === f && p.palette.number === n)?.meta.stage;

// ---- Palettes: one card per family, and one page per family
const pick = (arr, n) => arr.length <= n ? arr : Array.from({ length: n }, (_, i) => arr[Math.floor(i * arr.length / n)]);
const mosaic = f => isMat(f) ? `<div class="mosaic mat">${pick(f.materials, 24).map(m => `<span style="background:linear-gradient(${m.light},${m.typical} 50%,${m.dark})"></span>`).join('')}</div>` : isCombos(f)
  ? (size(f) ? `<div class="mosaic">${pick(f.combinations, 12).map(c => strip(c.colours, 'strip mini')).join('')}</div>` : `<div class="mosaic blank"><span>None made yet</span></div>`)
  : `<div class="mosaic dots">${pick(f.colours, 40).map(c => `<span style="background:${c.hex}"></span>`).join('')}</div>`;
page({ title: 'Palettes', path: '/palettes', wide: true, twin: '/palettes.json', html: `
<p class="eyebrow">The starting point</p><h1>Palette families.</h1>
<p class="lede">Each family is a body of colour work with its own character. Some are ready-made combinations; others are collections of single colours for the studio to combine. Every project begins here.</p>
<div class="families">${families.map(f => `
<article class="family">${mosaic(f)}
<div class="about"><p class="eyebrow">${isCombos(f) ? (size(f) ? countLabel(f) : 'Combinations · none yet') : isMat(f) ? 'Natural materials · ' + countLabel(f) + ' as colour ranges' : 'Colour collection · ' + countLabel(f)}</p><h2>${esc(f.title)}</h2><p>${esc(f.description)}</p>
<a class="button" href="/palettes/${f.id}">Open the ${esc(f.name)} family</a></div></article>`).join('')}
<article class="family more"><div class="about"><p class="eyebrow">Room for more</p><h2>Further families</h2><p>Other professional palettes, looks and colour families can be added here, each with its own description and page.</p></div></article></div>` });
write('palettes.json', JSON.stringify(families.map(({ combinations, colours, materials, ...f }) => ({ ...f, count: (combinations || colours || materials).length, page: `${SITE}/palettes/${f.id}`, data_file: `${SITE}/palettes/${f.id}.json` }))));

const filterScript = `<script>document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('[data-n]:not(button)').forEach(p=>p.hidden=b.dataset.n!=='0'&&p.dataset.n!==b.dataset.n)})</script>`;
const colourList = c => `<ul>${c.colours.map(x => `<li><i style="background:${x.hex}"></i>${x.role ? `<span class="role">${esc(x.role)}</span>` : ''}<span class="nm">${esc(x.name)}${x.from ? `<small>${esc(x.from)}</small>` : ''}</span><code>${x.hex}</code></li>`).join('')}${(c.materialRanges || []).map(x => `<li><i class="matdot" style="background:linear-gradient(${x.light},${x.typical},${x.dark})"></i><span class="role">Natural</span><span class="nm">${esc(x.name)}<small>Materials</small></span></li>`).join('')}</ul>`;
const palTitle = (f, c) => { const st = statusOf(f, c.number); return `<h2>${c.name ? `${esc(c.name)} <small class="num">No. ${c.number}</small>` : `No. ${c.number}`}${st ? `<em>${esc(st === 'In the library' ? 'Approved' : 'In progress')}</em>` : ''}</h2>`; };
// Open any folded section that holds the palette named in the address (e.g. /palettes/studio#p7).
const openTarget = `<script>(function(){var t=location.hash&&document.getElementById(location.hash.slice(1));for(var e=t;e;e=e.parentElement)if(e.tagName==='DETAILS')e.open=true;if(t)t.scrollIntoView();})()</script>`;
function combosHtml(f) {
  if (!size(f)) return `<div class="empty"><p>No combinations have been made yet.</p><p class="note">When the studio creates one it appears here with its colours, the families they came from, and the reason it was made. The rules are in <a href="/guide">the Guide</a>.</p></div>`;
  if (f.series && f.series.length) {
    // Series families: each series folds; each palette shows colours, name, sentence and score, with the details one tap away.
    return [...new Set(f.combinations.map(c => c.series || ''))].map(s => {
      const list = f.combinations.filter(c => (c.series || '') === s), about = (f.series || []).find(x => x.name === s)?.about;
      return `<details class="series-box">
<summary><div class="sb-text"><p class="eyebrow">Series · ${list.length} palettes</p><h2>${esc(s || 'Single palettes')}</h2>${about ? `<p class="series-about">${esc(about)}</p>` : ''}</div>
<div class="sb-preview">${list.map(c => strip(c.colours, 'strip mini')).join('')}</div><span class="sb-toggle" aria-hidden="true"></span></summary>
<div class="grid">${list.map(c => `
<article class="pal" id="p${c.number}">${strip(c.colours)}${palTitle(f, c)}
${c.intent ? `<p class="intent">${esc(c.intent)}</p>` : ''}
${c.scheme ? `<p class="scheme-score" title="${esc(c.scheme.good.join('. '))}">${esc(c.scheme.verdict)} · ${c.scheme.score}</p>` : ''}
<details class="pal-more"><summary>Colours and materials</summary>${colourList(c)}</details></article>`).join('')}</div></details>`;
    }).join('') + openTarget;
  }
  const sizes = [...new Set(f.combinations.map(c => c.colours.length))].sort();
  const word = { 2: 'Two colours', 3: 'Three', 4: 'Four', 5: 'Five' };
  return `<div class="filters" role="group" aria-label="Filter by number of colours">
<button data-n="0" aria-pressed="true">All ${size(f)}</button>${sizes.map(n => `<button data-n="${n}">${word[n] || n + ' colours'}</button>`).join('')}</div>
<div class="grid">${f.combinations.map(c => `
<article class="pal" data-n="${c.colours.length}" id="p${c.number}">${strip(c.colours)}${palTitle(f, c)}
${c.intent ? `<p class="intent">${esc(c.intent)}</p>` : ''}${colourList(c)}</article>`).join('')}</div>${filterScript}`;
}
function materialsHtml(f) {
  const warmth = h => { const { a, b } = lab(h); const hue = (Math.atan2(b, a) * 180 / Math.PI + 360) % 360; return Math.hypot(a, b) < 6 ? 'neutral' : hue < 110 || hue > 330 ? 'warm' : 'cool'; };
  const range = m => { const v = [m.light, m.typical, m.dark].map(lab); const r = k => `${Math.round(Math.min(...v.map(x => x[k])))}–${Math.round(Math.max(...v.map(x => x[k])))}`; return `Lightness ${r('L')} · strength ${r('C')} · ${warmth(m.typical)}`; };
  const groups = [...new Set(f.materials.map(m => m.group))];
  return `<p class="note">Each material shows a range: <b>light</b>, <b>typical</b> and <b>dark</b>. Tags say whether it belongs inside, outside, or both.</p>` + groups.map(g => `<h2 class="group">${esc(g)}</h2><div class="mats">${f.materials.filter(m => m.group === g).map(m => `
<article class="mat-card"><div class="mat-band">${['light', 'typical', 'dark'].map(k => `<span style="background:${m[k]};color:${ink(m[k])}"><i>${k}</i><code>${m[k]}</code></span>`).join('')}</div>
<div class="mat-text"><h3>${esc(m.name)}</h3><p class="mat-tags">${m.where.map(w => `<em>${w}</em>`).join('')}</p><p>${esc(m.texture)}.</p><p class="ages">Ageing: ${esc(m.ages)}.</p>${m.use ? `<p class="use"><b>Use:</b> ${esc(m.use)}.</p>` : ''}<p class="range">${range(m)}</p></div></article>`).join('')}</div>`).join('');
}
function coloursHtml(f) {
  const groups = [...new Set(f.colours.map(c => c.group || ''))];
  const tile = c => `<div class="tile" title="${esc(c.note || c.name)}"><span style="background:${c.hex}"></span><b>${esc(c.name)}</b><code>${c.hex}</code>${c.note ? `<small>${esc(c.note)}</small>` : ''}</div>`;
  return groups.map(g => `${g ? `<h2 class="group">${esc(g)}</h2>` : ''}<div class="tiles">${f.colours.filter(c => (c.group || '') === g).map(tile).join('')}</div>`).join('');
}
for (const f of families) {
  page({ title: f.title, path: '/palettes/' + f.id, wide: true, twin: `/palettes/${f.id}.json`, html: `
<p class="eyebrow"><a href="/palettes">Palette families</a> / ${esc(f.name)}</p><h1>${esc(f.title)}</h1>
<p class="lede">${esc(f.description)}</p>
${isTrio(f) ? `<div class="tgrid">${f.combinations.map(c => `<a class="tlink" id="p${c.number}" href="/trios/${c.number}">${trioCard(c, ' small')}<b>${esc(c.name)}</b><span>${esc(c.intent)}</span></a>`).join('')}</div>` : isCombos(f) ? combosHtml(f) : isMat(f) ? materialsHtml(f) : coloursHtml(f)}
<p class="note">${esc(f.note)} Data: ${esc(f.data)}.</p>` });
  write(`palettes/${f.id}.json`, JSON.stringify(f));
}
for (const f of families.filter(isTrio)) for (const c of f.combinations) {
  page({ title: c.name, path: '/trios/' + c.number, wide: true, html: `<div class="trio-page">${trioCard(c)}
<div class="trio-side"><p class="eyebrow"><a href="/palettes/${f.id}">Trios</a> · No. ${c.number}</p><h1>${esc(c.name)}</h1><p class="lede">${esc(c.intent)}</p>
<ul class="trio-roles">${c.colours.map(x => `<li><i style="background:${x.hex}"></i><b>${esc(x.name)}</b><code>${x.hex}</code></li>`).join('')}</ul>
<p class="note">House style: ${esc(f.house)}. Light for this trio: ${c.light === 'daylight' ? 'soft daylight, so the cool colours stay true' : 'warm golden lamplight'}.</p>${c.changed ? `<p class="note">Changed ${esc(c.changed)}</p>` : ''}
<h2>Make the room: first try</h2>
<ol class="steps"><li>Download the card.</li><li>Start a <b>new</b> ChatGPT chat. Attach only the card (it is Image 1), paste the prompt, send. Add nothing.</li><li>Judge the first image with the five questions below. Bring it here either way.</li><li>If it missed, bring it here; the studio changes the room sheet and you start a new chat. A small fix in the same chat only works as a surgical edit: “Change only … Keep everything else exactly the same.” Never a general request like “make it more luxurious”.</li></ol>
<p><a class="button" href="/trios/${cardFile(c)}" download="${cardFile(c)}">Download card</a> <span class="note">${esc(f.cardChecks.size)} image · each swatch measured within ${Math.max(...f.cardChecks.cards[c.number].swatches.map(x => x.deltaE00)).toFixed(1)} of its colour (1.0 or less is not visible)</span></p>
<div class="prompt-copy"><button type="button" class="copy">Copy</button><pre>${esc(TRIO_PROMPT(c))}</pre></div>
<h2>Is it a hit?</h2><ol class="hit"><li>The walls read as ${esc(c.colours[0].name)} on the card.</li><li>The upholstery reads as ${esc(c.colours[1].name)}.</li><li>Whites and ${esc(c.colours[2].name.toLowerCase())} look clean, not yellow or beige.</li><li>Only what the prompt describes is in the room.</li><li>You would post it as it is.</li></ol><p class="note">Five yeses is a hit. The first-try hit rate is how the studio measures the method.</p></div></div>
<script>document.querySelectorAll('.prompt-copy .copy').forEach(b=>b.onclick=()=>navigator.clipboard.writeText(b.nextElementSibling.innerText).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1500)}))</script>` });
}

// ---- Guide
page({ title: 'The Guide', path: '/guide', twin: '/guide.md', html: `<p class="facts"><span>version · ${esc(guide.meta.version)}</span><span>updated · ${esc(guide.meta.updated)}</span><span>${esc(guide.meta.status)}</span></p>${md(guide.body)}` });
write('guide.md', guide.raw);

// ---- Current project
// The owner's three moments; everything else the studio does on its own.
const ownerMoments = { Queued: 'Choose the palette', Directed: 'Pick a room idea', Approved: 'Approve the piece' };
const rosterState = (p, d) => p.notes.some(n => n.expert.id === d.id) ? ['spoken', 'Has spoken'] : p.next?.id === d.id ? ['next', 'Up next'] : ['later', 'Joins at ' + d.speaks.filter(s => stages.indexOf(s) >= stages.indexOf(p.meta.stage))[0]];
const expertName = d => d.name + (d.who ? ` (${d.who})` : '');
function projectText(p) {
  return `# ${p.meta.title} — ${p.family.label} ${p.palette.number}

Stage: ${p.meta.stage} (stages: ${stages.join(' → ')})
The owner decides at three moments: ${Object.entries(ownerMoments).map(([s, m]) => `${m} (${s})`).join('; ')}. Everything else is the studio's job.
Updated: ${p.meta.updated}

## Palette
${p.palette.colours.map(c => `- ${c.name} ${c.hex}`).join('\n')}

${p.body}
${p.turn ? `
## Waiting on the owner: ${p.turn.meta.question}
${p.turn.body}
` : ''}
## At the table (in order)
${p.notes.map(n => `### ${expertName(n.expert)} — ${n.meta.stage} — ${n.meta.date}
${n.body}
`).join('\n')}${p.next ? `
### Up next: ${expertName(p.next)}
${p.meta.next_note || ''}
` : ''}
${p.sitdown ? `## The sit-down\n${p.sitdown.body}\n\n` : ''}${p.prompt ? `## Prompt for the first image\n${p.prompt.body}\n\n` : ''}## The experts
${desks.map(d => `- ${expertName(d)}: ${d.role} Speaks at: ${d.speaks.join(', ')}. Judges: ${d.judges}`).join('\n')}

## Image
None yet.`;
}
function projectHtml(p) {
  const at = stages.indexOf(p.meta.stage);
  const cols = p.palette.colours;
  const badge = (d, cls = '') => `<span class="badge${cls}" style="background:${d.colour}" title="${esc(d.name)} · badge colour ${esc(d.colourName)}" aria-hidden="true">${esc(d.mark)}</span>`;
  return `<p class="eyebrow">Current project · <a href="/palettes/${p.family.id}#p${p.palette.number}">${esc(p.family.label)} ${p.palette.number}</a></p>
<h1 class="pj-title">${esc(p.meta.title)}</h1>
<div class="band">${cols.map(c => `<div style="background:${c.hex};color:${ink(c.hex)}"><b>${esc(c.name)}</b><code>${c.hex}</code></div>`).join('')}</div>
<ol class="journey">${stages.map((s, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}${ownerMoments[s] ? ' yours' : ''}"><span>${s}</span>${ownerMoments[s] ? `<em>You: ${ownerMoments[s].toLowerCase()}</em>` : ''}</li>`).join('')}</ol>
<div class="studio"><div class="table">
${p.turn ? `<section class="turn"><p class="eyebrow">Your turn</p><h2>${esc(p.turn.meta.question)}</h2>${md(p.turn.body)}</section>` : `<p class="note quiet">Nothing is waiting on you. The studio is working.</p>`}
<h2 class="group">At the table</h2>
<ol class="feed">${p.notes.map(n => `<li>${badge(n.expert)}<div class="said"><p class="who"><b>${esc(n.expert.name)}</b>${n.expert.who ? ` <small>${esc(n.expert.who)}</small>` : ''}<span class="tag">${esc(n.meta.stage)}</span></p>${md(n.body)}</div></li>`).join('')}
${p.next ? `<li class="upnext"><span class="badge ghost" style="color:${p.next.colour};border-color:${p.next.colour}" aria-hidden="true">${esc(p.next.mark)}</span><div class="said"><p class="who"><b>${esc(p.next.name)}</b><span class="tag">Up next</span></p><p>${esc(p.meta.next_note || '')}</p></div></li>` : ''}</ol>
${p.sitdown ? `<section class="sitdown"><h2 class="group">The sit-down</h2><div class="said">${md(p.sitdown.body)}</div></section>` : ''}
${p.prompt ? `<section class="prompt"><div class="prompt-head"><h2 class="group">Prompt for the first image</h2><button type="button" class="copy" onclick="navigator.clipboard.writeText(this.closest('.prompt').querySelector('.prompt-body').innerText).then(()=>{this.textContent='Copied'})">Copy</button></div><div class="prompt-body">${md(p.prompt.body)}</div></section>` : ''}
</div>
<aside class="side">
<figure class="plate"><div class="room"><span>Room image</span></div><div class="sw">${cols.map(c => `<span style="background:${c.hex}"></span>`).join('')}</div>
<figcaption>What gets shared: the room beside its exact swatches.</figcaption></figure>
<h2 class="group">The experts</h2>
<ul class="roster">${desks.map(d => { const [cls, label] = rosterState(p, d); return `<li class="${cls}">${badge(d, ' sm')}<div><b>${esc(d.name)}${d.who ? ` <small>${esc(d.who)}</small>` : ''}</b><span>${esc(d.role)}</span></div><em>${esc(label)}</em></li>`; }).join('')}</ul>
</aside></div>`;
}
if (current) {
  page({ title: 'Current project', path: '/project', wide: true, twin: '/project.md', html: projectHtml(current) });
  write('project.md', projectText(current));
}

// ---- Instructions: the ChatGPT project instructions, newest first, each with a Copy button
const chatDir = join(src, 'chatgpt');
const instr = existsSync(chatDir) ? readdirSync(chatDir).filter(f => /^INSTRUCTIONS-v\d+\.md$/.test(f)).map(f => parse(join(chatDir, f)))
  .sort((a, b) => Number(b.meta.version) - Number(a.meta.version)) : [];
if (instr.length) {
  const copyable = h => h.replace(/<pre>/g, '<div class="prompt-copy"><button type="button" class="copy">Copy</button><pre>').replace(/<\/pre>/g, '</pre></div>');
  const [cur, ...older] = instr;
  page({ title: 'Instructions', path: '/instructions', twin: '/instructions.md', html: `<p class="eyebrow">ChatGPT project · version ${esc(cur.meta.version)} · ${esc(cur.meta.status)}</p><h1>Instructions</h1>
<div class="notebook">${copyable(md(cur.body))}</div>
${older.map(o => `<details class="older"><summary>Version ${esc(o.meta.version)} · ${esc(o.meta.date)} · ${esc(o.meta.author)}</summary><div class="notebook">${copyable(md(o.body))}</div></details>`).join('')}
<script>document.querySelectorAll('.prompt-copy .copy').forEach(b=>b.onclick=()=>navigator.clipboard.writeText(b.nextElementSibling.innerText).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1500)}))</script>` });
  write('instructions.md', cur.raw);
}

// ---- Notebook: what the studio is learning about making images (working notes; prompts get a Copy button)
const nbDir = join(src, 'notebook');
const notebook = existsSync(join(nbDir, 'NOTEBOOK.md')) ? parse(join(nbDir, 'NOTEBOOK.md')) : null;
const attempts = existsSync(join(nbDir, 'attempts.json')) ? JSON.parse(readFileSync(join(nbDir, 'attempts.json'), 'utf8')) : null;
if (notebook) {
  mkdirSync(join(out, 'notebook', 'img'), { recursive: true });
  const groups = attempts ? (attempts.groups || [attempts]) : [];
  for (const g of groups) for (const a of g.attempts) copyFileSync(join(nbDir, 'img', a.image), join(out, 'notebook', 'img', a.image));
  const body = md(notebook.body.replace(/^# .*\n/, '')).replace(/<pre>/g, '<div class="prompt-copy"><button type="button" class="copy">Copy</button><pre>').replace(/<\/pre>/g, '</pre></div>');
  const verdict = { good: 'Good', closer: 'Closer', miss: 'Miss' };
  const timeline = groups.map((g, gi) => `<h2>${gi ? '' : 'Attempts, palette by palette: '}${esc(g.palette.name)}</h2><p><a href="${g.palette.family === 'trios' ? '/trios/' + g.palette.number : '/palettes/' + g.palette.family + '#p' + g.palette.number}">${esc(g.palette.label || 'Studio No.')} ${g.palette.number}</a>, made with ${esc(g.made_with)}.</p>
<ol class="attempts">${g.attempts.map(a => `<li class="att ${a.verdict}"><figure><img src="/notebook/img/${a.image}" alt="Attempt ${a.n} for ${esc(g.palette.name)}" loading="lazy"><span class="att-tag">${a.n} · ${verdict[a.verdict] || a.verdict}</span></figure><p class="asked"><b>Asked:</b> ${esc(a.asked)}</p><p>${esc(a.note)}</p></li>`).join('')}</ol>`).join('');
  page({ title: 'Notebook', path: '/notebook', wide: true, twin: '/notebook.md', html: `<p class="eyebrow">Notebook · ${esc(notebook.meta.status)} · updated ${esc(notebook.meta.updated)}</p><h1>What the studio is learning about making images</h1>
<div class="notebook">${body}</div>${timeline}
<script>document.querySelectorAll('.prompt-copy .copy').forEach(b=>b.onclick=()=>navigator.clipboard.writeText(b.nextElementSibling.innerText).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1500)}))</script>` });
  write('notebook.md', notebook.raw + groups.map(g => '\n## Attempts: ' + g.palette.name + '\n' + g.attempts.map(a => `${a.n}. [${a.verdict}] Asked: ${a.asked} Result: ${a.note}`).join('\n')).join('\n') + '\n');
}

// ---- Library: finished pieces only (room beside its swatches). A project enters it at stage "In the library";
// its finished image is the file named in the project's `image:` field, copied to /library/.
const pieceImage = p => {
  if (!p.meta.image) return null;
  const from = join(src, 'projects', p.id, p.meta.image);
  if (!existsSync(from)) throw new Error(`${p.id}: image ${p.meta.image} not found`);
  const to = `library/${p.id}-${p.meta.image}`; mkdirSync(join(out, 'library'), { recursive: true }); copyFileSync(from, join(out, to));
  return '/' + to;
};
const pieceCard = p => { const img = pieceImage(p); return `<article class="piece">
<figure class="plate">${img ? `<img class="room" src="${img}" alt="${esc(p.meta.room || 'Room')} in ${esc(p.palette.colours.map(c => c.name).join(', '))}" loading="lazy">` : `<div class="room"><span>Room image</span></div>`}<div class="sw">${p.palette.colours.map(c => `<span style="background:${c.hex}" title="${esc(c.name)} ${c.hex}"></span>`).join('')}</div></figure>
<div class="piece-text"><h2>${esc(p.family.label)} ${p.palette.number}${p.meta.room ? ` <small>${esc(p.meta.room)}</small>` : ''}</h2>
<p>${p.palette.colours.map(c => esc(c.name)).join(' · ')}</p>${p.meta.approved ? `<p class="when">Finished ${esc(p.meta.approved)}</p>` : ''}</div></article>`; };
const libraryHtml = () => `<p class="eyebrow">Finished work</p><h1>Library</h1>
<p class="lede">Every piece the studio has finished: a room beside its exact swatches. These are the images that get shared.</p>
<p class="facts"><span>${approved.length} ${approved.length === 1 ? 'piece' : 'pieces'}</span>${approved.length ? `<span>${new Set(approved.map(p => p.family.id)).size} palette ${new Set(approved.map(p => p.family.id)).size === 1 ? 'family' : 'families'}</span>` : ''}</p>
<div class="gallery">${approved.length ? approved.slice().reverse().map(pieceCard).join('') : `<article class="piece ghost">
<figure class="plate"><div class="room"><span>Your first piece</span></div><div class="sw">${(current ? current.palette.colours : []).map(c => `<span style="background:${c.hex}"></span>`).join('')}</div></figure>
<div class="piece-text"><h2>Nothing finished yet</h2><p>When you approve a piece it lands here, newest first, as it will be posted: the room on the left, its swatches on the right.</p></div></article>`}</div>`;
page({ title: 'Library', path: '/library', wide: true, twin: '/library.json', html: libraryHtml() });
write('library.json', JSON.stringify(approved.map(p => ({ project: p.id, family: p.family.id, palette: p.palette.number, colours: p.palette.colours, room: p.meta.room || null, finished: p.meta.approved || null, image: p.meta.image ? `${SITE}/library/${p.id}-${p.meta.image}` : null })), null, 1));

// ---- Home: the front door of the owner's workshop
const pool = families.filter(isCombos).flatMap(f => f.combinations.map((c, i) => [f.id, f.label, c.number ?? i + 1, c.colours.map(x => [x.name, x.hex, x.role || '']), c.materials || null, c.name || '']));
const labMaterials = MATERIALS.map(({ name, group, light, typical, dark, where, use }) => ({ name, group, light, typical, dark, where, use }));
const featureHtml = ([fid, label, n, cs], tag) => `<div class="fblocks">${cs.map(([name, hex]) => `<div style="background:${hex};color:${ink(hex)}"><b>${esc(name)}</b><code>${hex}</code></div>`).join('')}</div>
<p class="fcap"><span>${esc(tag)}</span><a href="/palettes/${fid}#p${n}">${esc(label)} ${n}</a></p>`;
const homeFeature = current ? [current.family.id, current.family.label, current.palette.number, current.palette.colours.map(x => [x.name, x.hex])] : pool[0];
const homeHtml = () => {
  const at = current ? stages.indexOf(current.meta.stage) : -1;
  const mosaicFrom = pick(families.find(f => f.id === 'wada').combinations, 12).map(c => strip(c.colours, 'strip mini')).join('');
  return `<section class="h-hero">
<div class="h-intro"><p class="eyebrow">A workshop for colour</p>
<h1>Pick a palette. A studio of experts turns it into a room you'd want to live in.</h1>
<p class="lede">Architect, builder, interior designer, colour specialist, photographer, stylist and editor each have their say. What comes out is one image: the room beside its exact swatches.</p>
<div class="h-actions"><button type="button" class="button" id="surprise">Surprise me</button><a class="button ghost" href="/palettes">Browse palettes</a></div></div>
<figure class="feature" id="feature" aria-live="polite">${featureHtml(homeFeature, 'Featured')}</figure>
</section>
${current ? `<a class="h-now" href="/project">
<div class="h-now-strip">${current.palette.colours.map(c => `<span style="background:${c.hex}"></span>`).join('')}</div>
<div class="h-now-text"><p class="eyebrow">On the table now</p><h2>${esc(current.meta.title)} <small>${esc(current.family.label)} ${current.palette.number}</small></h2>
<ol class="dots" aria-label="Stage ${at + 1} of ${stages.length}: ${esc(current.meta.stage)}">${stages.map((s, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}" title="${s}"></li>`).join('')}</ol>
<p class="h-now-status">${current.turn ? `<strong>Your turn:</strong> ${esc(current.turn.meta.question)}` : `${esc(current.meta.stage)} · nothing is waiting on you`}</p></div>
<span class="h-go" aria-hidden="true">→</span></a>` : ''}
${(() => { const st = families.find(f => f.id === 'studio'); const fresh = st ? st.combinations.slice(-6) : []; return fresh.length ? `<section class="fresh"><div class="fresh-head"><p class="eyebrow">Fresh from the studio</p><a href="/palettes/studio">All studio palettes →</a></div>
<div class="fresh-row">${fresh.map(c => `<a class="fresh-card" href="/palettes/studio#p${c.number}">${strip(c.colours, 'strip')}<b>${esc(c.name)}</b><span>${esc(c.intent)}</span></a>`).join('')}</div></section>` : ''; })()}
<div class="doors">
<a class="door" href="/palettes"><div class="mosaic">${mosaicFrom}</div><div class="door-text"><h2>Palettes</h2><p>${families.length} families · ${total} ready-made combinations · ${families.filter(f => f.kind === 'colours').reduce((n, f) => n + size(f), 0).toLocaleString('en')} single colours · ${families.filter(isMat).reduce((n, f) => n + size(f), 0)} materials</p></div></a>
<a class="door" href="/library"><div class="door-lib">${approved.length ? approved.slice(-2).map(p => strip(p.palette.colours, 'strip mini')).join('') : `<div class="plate mini"><div class="room"><span>First piece</span></div><div class="sw">${(current ? current.palette.colours : []).map(c => `<span style="background:${c.hex}"></span>`).join('')}</div></div>`}</div><div class="door-text"><h2>Library</h2><p>${approved.length ? `${approved.length} finished ${approved.length === 1 ? 'piece' : 'pieces'}` : 'Finished pieces will live here: each room beside its swatches.'}</p></div></a>
</div>
<a class="h-table" href="/project"><p class="eyebrow">The experts at the table</p><ul>${desks.map(d => `<li><span class="badge sm" style="background:${d.colour}" aria-hidden="true">${esc(d.mark)}</span>${esc(d.name)}</li>`).join('')}</ul></a>
<p class="h-guide">How the studio works, step by step: <a href="/guide">the Guide</a>.</p>
<script>${schemeSrc}</script>
<script>
(() => {
  const P = ${JSON.stringify(pool)}, M = ${JSON.stringify(labMaterials)};
  const fig = document.getElementById('feature'), btn = document.getElementById('surprise');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ink = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#22302b' : '#fff'; };
  const byName = n => M.find(m => m.name === n);
  const band = m => 'linear-gradient(90deg,' + m.light + ',' + m.typical + ' 50%,' + m.dark + ')';
  let at = Math.floor(Date.now() / 864e5) % P.length, tag = '', paints, mats, ranked, rAt, swapAt;
  const paintsOf = i => P[i][3].map(([name, hex, role]) => ['Field', 'Weight', 'Accent', 'Bridge'].includes(role) ? { name, hex, role } : { name, hex });
  const render = (pop) => {
    const [fid, label, n, cs, , title] = P[at];
    const sc = SCHEME.score(paints, mats);
    const cls = sc.score >= 85 ? 'good' : sc.score >= 70 ? 'ok' : 'poor';
    const ask = label.replace(' No.', '') + ' ' + n + ' with ' + mats.map(m => m.name.toLowerCase()).join(' and ');
    fig.innerHTML = '<div class="fblocks">' + cs.map(([nm, h, role]) => '<div style="background:' + h + ';color:' + ink(h) + '">' + (role ? '<i>' + role + '</i>' : '') + '<b>' + esc(nm) + '</b><code>' + h + '</code></div>').join('') + '</div>'
      + '<div class="lab-mats">' + mats.map((m, k) => '<div class="lab-mat"><span class="lab-sw" style="background:' + band(m) + '"></span><div><small>' + (k ? 'Touch' : 'Surface') + ' · natural</small><b>' + esc(m.name) + '</b>' + (m.use ? '<em>' + esc(m.use) + '</em>' : '') + '</div><button type="button" data-slot="' + k + '">Swap</button></div>').join('') + '</div>'
      + '<div class="lab-foot"><span class="lab-score ' + cls + '">' + sc.verdict + ' · ' + sc.score + '</span><button type="button" id="naturals">Try other naturals</button></div>'
      + '<details class="lab-why"><summary>Why this score</summary><ul>' + sc.good.map(t => '<li class="y">' + esc(t) + '</li>').join('') + sc.bad.map(t => '<li class="n">' + esc(t) + '</li>').join('') + '</ul></details>'
      + '<p class="fcap"><span>' + tag + '</span><a href="/palettes/' + fid + '#p' + n + '">' + esc(title ? title + ' · ' : '') + esc(label) + ' ' + n + '</a></p>'
      + '<p class="lab-ask">Like it? Tell the studio in chat: <q>' + esc(ask) + '</q></p>';
    fig.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => {
      const k = +b.dataset.slot, list = SCHEME.swaps(paints, M, mats[1 - k], mats[k]).filter(x => x.s.score >= 70);
      if (!list.length) return; swapAt[k] = (swapAt[k] + 1) % list.length; mats[k] = list[swapAt[k] % list.length].m; render();
    });
    fig.querySelector('#naturals').onclick = () => { rAt = (rAt + 1) % ranked.length; mats = ranked[rAt].pair.slice(); render(); };
    if (pop) { fig.classList.remove('pop'); void fig.offsetWidth; fig.classList.add('pop'); }
  };
  const show = (i, t) => {
    at = i; tag = t; paints = paintsOf(i);
    ranked = SCHEME.rank(paints, M).filter(x => x.s.score >= 70).slice(0, 25); rAt = 0; swapAt = [0, 0];
    const chosen = P[i][4];
    mats = chosen ? chosen.map(byName) : (ranked[0] ? ranked[0].pair.slice() : SCHEME.rank(paints, M)[0].pair.slice());
    render(true);
  };
  show(at, 'Today’s combination');
  btn.addEventListener('click', () => { let i; do { i = Math.floor(Math.random() * P.length); } while (i === at && P.length > 1); show(i, 'Surprise'); });
})();
</script>`;
};
page({ title: 'Studio', path: '/', wide: true, html: homeHtml() });

// ---- One complete text file for assistants (their readers may not follow links inside a page)
const whole = `# Architectural Color Studio — the whole project in one file

This file is complete; no other page needs to be opened.
Human pages: ${nav.map(([h]) => SITE + h).join(' · ')}
Palette families: ${SITE}/palettes.json — ${families.map(f => `${f.title} (${countLabel(f)}): ${SITE}/palettes/${f.id}.json`).join('; ')}

================================================================
PART 1 OF 3 — THE GUIDE (version ${guide.meta.version})
================================================================

${guide.body}

================================================================
PART 2 OF 3 — THE CURRENT PROJECT
================================================================

${current ? projectText(current) : 'There is no current project.'}

================================================================
PART 3 OF 3 — THE NOTEBOOK (making images; working notes)
================================================================

${notebook ? notebook.body : 'No notebook yet.'}

================================================================
END
`;
write('llms.txt', whole);
write('brief.txt', whole);
write('robots.txt', 'User-agent: *\nAllow: /\n');
console.log('built:', readdirSync(out, { recursive: true }).filter(f => /\.(html|md|txt|json)$/.test(f)).join(', '));

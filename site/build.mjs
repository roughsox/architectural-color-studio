// Builds the public site from the plain files in studio/.
// Pages: Palettes, Guide, Current project (with desks), Library. Each has a plain-text or JSON twin for assistants.
import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const nav = [['/palettes', 'Palettes'], ['/guide', 'Guide'], ['/project', 'Current project'], ['/library', 'Library']];

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
const size = f => isCombos(f) ? f.combinations.length : f.colours.length;
const countLabel = f => isCombos(f) ? (size(f) ? `${size(f)} ${size(f) === 1 ? 'combination' : 'combinations'}` : 'none yet') : `${size(f)} single colours`;
const total = families.filter(isCombos).reduce((n, f) => n + size(f), 0);
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
  return { id, ...p, family, palette, notes, turn, next: desks.find(d => d.id === p.meta.next) };
});
const current = projects.filter(p => p.meta.stage !== 'In the library').pop();
const approved = projects.filter(p => p.meta.stage === 'In the library');
const statusOf = (f, n) => projects.find(p => p.family === f && p.palette.number === n)?.meta.stage;

// ---- Palettes: one card per family, and one page per family
const pick = (arr, n) => arr.length <= n ? arr : Array.from({ length: n }, (_, i) => arr[Math.floor(i * arr.length / n)]);
const mosaic = f => isCombos(f)
  ? (size(f) ? `<div class="mosaic">${pick(f.combinations, 12).map(c => strip(c.colours, 'strip mini')).join('')}</div>` : `<div class="mosaic blank"><span>None made yet</span></div>`)
  : `<div class="mosaic dots">${pick(f.colours, 40).map(c => `<span style="background:${c.hex}"></span>`).join('')}</div>`;
page({ title: 'Palettes', path: '/palettes', wide: true, twin: '/palettes.json', html: `
<p class="eyebrow">The starting point</p><h1>Palette families.</h1>
<p class="lede">Each family is a body of colour work with its own character. Some are ready-made combinations; others are collections of single colours for the studio to combine. Every project begins here.</p>
<div class="families">${families.map(f => `
<article class="family">${mosaic(f)}
<div class="about"><p class="eyebrow">${isCombos(f) ? (size(f) ? countLabel(f) : 'Combinations · none yet') : 'Colour collection · ' + countLabel(f)}</p><h2>${esc(f.title)}</h2><p>${esc(f.description)}</p>
<a class="button" href="/palettes/${f.id}">Open the ${esc(f.name)} family</a></div></article>`).join('')}
<article class="family more"><div class="about"><p class="eyebrow">Room for more</p><h2>Further families</h2><p>Other professional palettes, looks and colour families can be added here, each with its own description and page.</p></div></article></div>` });
write('palettes.json', JSON.stringify(families.map(({ combinations, colours, ...f }) => ({ ...f, count: (combinations || colours).length, page: `${SITE}/palettes/${f.id}`, data_file: `${SITE}/palettes/${f.id}.json` }))));

const filterScript = `<script>document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('[data-n]:not(button)').forEach(p=>p.hidden=b.dataset.n!=='0'&&p.dataset.n!==b.dataset.n)})</script>`;
function combosHtml(f) {
  if (!size(f)) return `<div class="empty"><p>No combinations have been made yet.</p><p class="note">When the studio creates one it appears here with its colours, the families they came from, and the reason it was made. The rules are in <a href="/guide">the Guide</a>.</p></div>`;
  const sizes = [...new Set(f.combinations.map(c => c.colours.length))].sort();
  const word = { 2: 'Two colours', 3: 'Three', 4: 'Four', 5: 'Five' };
  return `<div class="filters" role="group" aria-label="Filter by number of colours">
<button data-n="0" aria-pressed="true">All ${size(f)}</button>${sizes.map(n => `<button data-n="${n}">${word[n] || n + ' colours'}</button>`).join('')}</div>
<div class="grid">${f.combinations.map(c => { const st = statusOf(f, c.number); return `
<article class="pal" data-n="${c.colours.length}" id="p${c.number}">${strip(c.colours)}
<h2>No. ${c.number}${st ? `<em>${esc(st === 'In the library' ? 'Approved' : 'In progress')}</em>` : ''}</h2>
${c.intent ? `<p class="intent">${esc(c.intent)}</p>` : ''}
<ul>${c.colours.map(x => `<li><i style="background:${x.hex}"></i>${esc(x.name)}${x.from ? ` <small>${esc(x.from)}</small>` : ''}<code>${x.hex}</code></li>`).join('')}</ul></article>`; }).join('')}</div>${filterScript}`;
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
${isCombos(f) ? combosHtml(f) : coloursHtml(f)}
<p class="note">${esc(f.note)} Data: ${esc(f.data)}.</p>` });
  write(`palettes/${f.id}.json`, JSON.stringify(f));
}

// ---- Guide
page({ title: 'The Guide', path: '/guide', twin: '/guide.md', html: `<p class="facts"><span>version · ${esc(guide.meta.version)}</span><span>updated · ${esc(guide.meta.updated)}</span><span>${esc(guide.meta.status)}</span></p>${md(guide.body)}` });
write('guide.md', guide.raw);

// ---- Current project
// The owner's three moments; everything else the studio does on its own.
const ownerMoments = { Queued: 'Choose the palette', Directed: 'Pick a room idea', Approved: 'Approve the piece' };
const ink = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#22302b' : '#fff'; };
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
## The experts
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

// ---- Library
page({ title: 'Library', path: '/library', wide: true, html: `<p class="eyebrow">Approved work</p><h1>Library</h1>${approved.length
  ? `<div class="grid">${approved.map(p => `<article class="pal">${strip(p.palette.colours)}<h2>${esc(p.meta.title)}</h2></article>`).join('')}</div>`
  : `<div class="empty"><p>Nothing has been approved yet.</p><p class="note">Finished pieces appear here once the owner signs them off: the room and its swatches side by side, with the record of how each was made one link away.</p></div>`}` });

// ---- Home: the front door of the owner's workshop
const pool = families.filter(isCombos).flatMap(f => f.combinations.map((c, i) => [f.id, f.label, c.number ?? i + 1, c.colours.map(x => [x.name, x.hex])]));
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
<div class="doors">
<a class="door" href="/palettes"><div class="mosaic">${mosaicFrom}</div><div class="door-text"><h2>Palettes</h2><p>${families.length} families · ${total} ready-made combinations · ${families.filter(f => !isCombos(f)).reduce((n, f) => n + size(f), 0).toLocaleString('en')} single colours</p></div></a>
<a class="door" href="/library"><div class="door-lib">${approved.length ? approved.slice(-2).map(p => strip(p.palette.colours, 'strip mini')).join('') : `<div class="plate mini"><div class="room"><span>First piece</span></div><div class="sw">${(current ? current.palette.colours : []).map(c => `<span style="background:${c.hex}"></span>`).join('')}</div></div>`}</div><div class="door-text"><h2>Library</h2><p>${approved.length ? `${approved.length} finished ${approved.length === 1 ? 'piece' : 'pieces'}` : 'Finished pieces will live here: each room beside its swatches.'}</p></div></a>
</div>
<a class="h-table" href="/project"><p class="eyebrow">The experts at the table</p><ul>${desks.map(d => `<li><span class="badge sm" style="background:${d.colour}" aria-hidden="true">${esc(d.mark)}</span>${esc(d.name)}</li>`).join('')}</ul></a>
<p class="h-guide">How the studio works, step by step: <a href="/guide">the Guide</a>.</p>
<script>
(() => {
  const P = ${JSON.stringify(pool)};
  const fig = document.getElementById('feature'), btn = document.getElementById('surprise');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ink = h => { const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#22302b' : '#fff'; };
  let at = Math.floor(Date.now() / 864e5) % P.length;
  const show = (i, tag) => {
    const [fid, label, n, cs] = P[i];
    fig.innerHTML = '<div class="fblocks">' + cs.map(([nm, h]) => '<div style="background:' + h + ';color:' + ink(h) + '"><b>' + esc(nm) + '</b><code>' + h + '</code></div>').join('') + '</div>'
      + '<p class="fcap"><span>' + tag + '</span><a href="/palettes/' + fid + '#p' + n + '">' + esc(label) + ' ' + n + '</a></p>';
    fig.classList.remove('pop'); void fig.offsetWidth; fig.classList.add('pop');
  };
  show(at, 'Today’s combination');
  btn.addEventListener('click', () => { let i; do { i = Math.floor(Math.random() * P.length); } while (i === at && P.length > 1); at = i; show(at, 'Surprise'); });
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
PART 1 OF 2 — THE GUIDE (version ${guide.meta.version})
================================================================

${guide.body}

================================================================
PART 2 OF 2 — THE CURRENT PROJECT
================================================================

${current ? projectText(current) : 'There is no current project.'}

================================================================
END
`;
write('llms.txt', whole);
write('brief.txt', whole);
write('robots.txt', 'User-agent: *\nAllow: /\n');
console.log('built:', readdirSync(out, { recursive: true }).filter(f => /\.(html|md|txt|json)$/.test(f)).join(', '));

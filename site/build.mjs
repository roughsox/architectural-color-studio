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
  .map(f => JSON.parse(readFileSync(join(src, 'palettes', f), 'utf8')));
const total = families.reduce((n, f) => n + f.combinations.length, 0);
const desks = JSON.parse(readFileSync(join(src, 'desks.json'), 'utf8'));
const stages = ['Queued', 'Directed', 'Requested', 'Received', 'Reviewed', 'Approved', 'In the library'];
const guide = parse(join(src, 'guide', 'GUIDE.md'));

const projects = readdirSync(join(src, 'projects')).sort().map(id => {
  const dir = join(src, 'projects', id);
  const p = parse(join(dir, 'project.md'));
  const family = families.find(f => f.id === p.meta.family);
  const palette = family.combinations.find(c => c.number === Number(p.meta.palette));
  const deskNotes = Object.fromEntries(desks.map(d => {
    const f = join(dir, 'desks', d.id + '.md');
    return [d.id, existsSync(f) ? parse(f) : null];
  }));
  return { id, ...p, family, palette, deskNotes };
});
const current = projects.filter(p => p.meta.stage !== 'In the library').pop();
const approved = projects.filter(p => p.meta.stage === 'In the library');
const statusOf = (f, n) => projects.find(p => p.family === f && p.palette.number === n)?.meta.stage;

// ---- Palettes: one card per family, and one page per family
page({ title: 'Palettes', path: '/palettes', wide: true, twin: '/palettes.json', html: `
<p class="eyebrow">The starting point</p><h1>Palette families.</h1>
<p class="lede">Each family is a body of professional colour work with its own character. Every project begins by opening a family and choosing a combination.</p>
<div class="families">${families.map(f => `
<article class="family"><div class="mosaic">${f.combinations.filter((_, i) => i % Math.ceil(f.combinations.length / 12) === 0).slice(0, 12).map(c => strip(c.colours, 'strip mini')).join('')}</div>
<div class="about"><p class="eyebrow">${f.combinations.length} combinations</p><h2>${esc(f.title)}</h2><p>${esc(f.description)}</p>
<a class="button" href="/palettes/${f.id}">Open the ${esc(f.name)} family</a></div></article>`).join('')}
<article class="family more"><div class="about"><p class="eyebrow">Room for more</p><h2>Further families</h2><p>Other professional palettes, looks and colour families can be added here, each with its own description and page.</p></div></article></div>` });
write('palettes.json', JSON.stringify(families.map(({ combinations, ...f }) => ({ ...f, count: combinations.length, page: `${SITE}/palettes/${f.id}`, data_file: `${SITE}/palettes/${f.id}.json` }))));

for (const f of families) {
  const sizes = [...new Set(f.combinations.map(c => c.colours.length))].sort();
  const word = { 2: 'Two colours', 3: 'Three', 4: 'Four', 5: 'Five' };
  page({ title: f.title, path: '/palettes/' + f.id, wide: true, twin: `/palettes/${f.id}.json`, html: `
<p class="eyebrow"><a href="/palettes">Palette families</a> / ${esc(f.name)}</p><h1>${esc(f.title)}</h1>
<p class="lede">${esc(f.description)}</p>
<div class="filters" role="group" aria-label="Filter by number of colours">
<button data-n="0" aria-pressed="true">All ${f.combinations.length}</button>${sizes.map(n => `<button data-n="${n}">${word[n] || n + ' colours'}</button>`).join('')}</div>
<div class="grid">${f.combinations.map(c => { const st = statusOf(f, c.number); return `
<article class="pal" data-n="${c.colours.length}" id="p${c.number}">${strip(c.colours)}
<h2>No. ${c.number}${st ? `<em>${esc(st === 'In the library' ? 'Approved' : 'In progress')}</em>` : ''}</h2>
<ul>${c.colours.map(x => `<li><i style="background:${x.hex}"></i>${esc(x.name)}<code>${x.hex}</code></li>`).join('')}</ul></article>`; }).join('')}</div>
<p class="note">${esc(f.note)} Data: ${esc(f.data)}.</p>
<script>document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelectorAll('.pal').forEach(p=>p.hidden=b.dataset.n!=='0'&&p.dataset.n!==b.dataset.n)})</script>` });
  write(`palettes/${f.id}.json`, JSON.stringify(f));
}

// ---- Guide
page({ title: 'The Guide', path: '/guide', twin: '/guide.md', html: `<p class="facts"><span>version · ${esc(guide.meta.version)}</span><span>updated · ${esc(guide.meta.updated)}</span><span>${esc(guide.meta.status)}</span></p>${md(guide.body)}` });
write('guide.md', guide.raw);

// ---- Current project
const deskState = n => n ? (n.meta.status || 'draft') : 'waiting';
function projectText(p) {
  return `# ${p.meta.title} — ${p.family.label} ${p.palette.number}

Stage: ${p.meta.stage} (stages: ${stages.join(' → ')})
Status: ${p.meta.status}
Updated: ${p.meta.updated}

## Palette
${p.palette.colours.map(c => `- ${c.name} ${c.hex}`).join('\n')}

${p.body}

## Image
None yet.

## Desks
${desks.map(d => `### ${d.name} — ${d.phase} — ${deskState(p.deskNotes[d.id])}
Judges: ${d.judges}
${p.deskNotes[d.id] ? '\n' + p.deskNotes[d.id].body + '\n' : ''}`).join('\n')}`;
}
function projectHtml(p) {
  const at = stages.indexOf(p.meta.stage);
  const phases = [...new Set(desks.map(d => d.phase))];
  return `<p class="eyebrow">Current project</p><h1>${esc(p.meta.title)} <a class="sub" href="/palettes/${p.family.id}#p${p.palette.number}">${esc(p.family.label)} ${p.palette.number}</a></h1>
<ol class="stages">${stages.map((s, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}">${s}</li>`).join('')}</ol>
<div class="hero"><div class="frame"><span>No image yet</span></div><div class="side">${chips(p.palette.colours)}<p class="note">${esc(p.meta.status)}</p>${md(p.body)}</div></div>
${phases.map(ph => `<section class="phase"><h2>${esc(ph)}</h2><div class="desks">${desks.filter(d => d.phase === ph).map(d => { const n = p.deskNotes[d.id]; const st = deskState(n); return `
<article class="desk"><header><h3>${esc(d.name)}</h3><span class="state ${esc(st.split(' ')[0])}">${esc(st)}</span></header>
<p class="judges">${esc(d.judges)}</p>${n ? `<div class="findings">${md(n.body)}</div>` : ''}</article>`; }).join('')}</div></section>`).join('')}`;
}
if (current) {
  page({ title: 'Current project', path: '/project', wide: true, twin: '/project.md', html: projectHtml(current) });
  write('project.md', projectText(current));
}

// ---- Library
page({ title: 'Library', path: '/library', wide: true, html: `<p class="eyebrow">Approved work</p><h1>Library</h1>${approved.length
  ? `<div class="grid">${approved.map(p => `<article class="pal">${strip(p.palette.colours)}<h2>${esc(p.meta.title)}</h2></article>`).join('')}</div>`
  : `<div class="empty"><p>Nothing has been approved yet.</p><p class="note">Finished pieces appear here once the owner signs them off: the room and its swatches side by side, with the record of how each was made one link away.</p></div>`}` });

// ---- Home
page({ title: 'Studio', path: '/', html: `<p class="eyebrow">A study in colour and space</p>
<h1>Rooms that show what a colour combination feels like to live in.</h1>
<ul class="list"><li><a href="/palettes">Palettes</a><span>${families.length} ${families.length === 1 ? 'family' : 'families'} · ${total} combinations</span></li>
<li><a href="/guide">The Guide</a><span>How the studio works</span></li>
<li><a href="/project">Current project</a><span>${current ? `${esc(current.meta.title)} · ${esc(current.meta.stage)}` : 'None'}</span></li>
<li><a href="/library">Library</a><span>${approved.length} approved</span></li></ul>` });

// ---- One complete text file for assistants (their readers may not follow links inside a page)
const whole = `# Architectural Color Studio — the whole project in one file

This file is complete; no other page needs to be opened.
Human pages: ${nav.map(([h]) => SITE + h).join(' · ')}
Palette families: ${SITE}/palettes.json — ${families.map(f => `${f.title} (${f.combinations.length}): ${SITE}/palettes/${f.id}.json`).join('; ')}

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

// Builds the public reading site from the plain files in studio/.
// Every page is written twice: as HTML for people and as the original Markdown (.md) for assistants.
import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'studio');
const out = join(root, 'dist');
rmSync(out, { recursive: true, force: true });

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function parse(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = {}; const palette = [];
  if (m) for (const line of m[1].split('\n')) {
    const p = line.match(/name:\s*"([^"]+)",\s*hex:\s*"(#[0-9A-Fa-f]{6})",\s*role:\s*"([^"]+)"/);
    if (p) { palette.push({ name: p[1], hex: p[2], role: p[3] }); continue; }
    const kv = line.match(/^([a-z_]+):\s*(.+)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^"|"$/g, '');
  }
  return { raw, meta, palette, body: m ? raw.slice(m[0].length) : raw };
}

const css = readFileSync(join(root, 'site', 'style.css'), 'utf8');
const nav = [['/', 'Studio'], ['/guide', 'Guide'], ['/project/current', 'Current project'], ['/shells', 'Room shells']];

function page({ title, html, path, meta = {}, palette = [], textPath }) {
  const strip = palette.length ? `<div class="strip">${palette.map(c =>
    `<div class="chip"><span style="background:${c.hex}"></span><b>${esc(c.name)}</b><code>${c.hex.toUpperCase()}</code><i>${esc(c.role)}</i></div>`).join('')}</div>` : '';
  const facts = ['version', 'updated', 'status'].filter(k => meta[k]).map(k => `<span>${k} · ${esc(meta[k])}</span>`).join('');
  const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Architectural Color Studio</title>
<meta name="description" content="Architectural Color Studio: written direction for rooms that show colour combinations.">
${textPath ? `<link rel="alternate" type="text/markdown" href="${textPath}">` : ''}
<style>${css}</style></head><body>
<header><a class="brand" href="/">A<span>/</span>C <small>Architectural Color Studio</small></a>
<nav>${nav.map(([h, t]) => `<a href="${h}"${h === path ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav></header>
<main>${facts ? `<p class="facts">${facts}</p>` : ''}${strip}${html}
${textPath ? `<p class="twin">Plain-text version of this page: <a href="${textPath}">${textPath}</a></p>` : ''}</main>
<footer>The files behind these pages are the source of truth. Assistants: everything for the current image is in one file, <a href="/llms.txt">/llms.txt</a>.</footer>
</body></html>`;
  const file = join(out, path === '/' ? 'index.html' : path.slice(1) + '.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, doc);
}

function publish(file, path) {
  const d = parse(file);
  const textPath = path + '.md';
  page({ title: d.meta.title || path, html: marked.parse(d.body).replace(/<table>/g, '<div class="tablewrap"><table>').replace(/<\/table>/g, '</table></div>'), path, meta: d.meta, palette: d.palette, textPath });
  const twin = join(out, textPath.slice(1));
  mkdirSync(dirname(twin), { recursive: true });
  writeFileSync(twin, d.raw);
  return d;
}

const guide = publish(join(src, 'guide', 'GUIDE.md'), '/guide');

const shells = readdirSync(join(src, 'shells')).filter(f => f.endsWith('.md')).map(f => {
  const name = f.replace(/\.md$/, '');
  return { name, ...publish(join(src, 'shells', f), '/shells/' + name) };
});
page({ title: 'Room shells', path: '/shells', html: `<h1>Room shells</h1><p>Each shell is one calm, reusable room: its size, windows, furniture positions, camera and light. A project pairs a palette with a shell.</p><ul class="list">${
  shells.map(s => `<li><a href="/shells/${s.name}">${esc(s.meta.title)}</a><span>${esc(s.meta.status || '')}</span></li>`).join('')}</ul>` });

const projects = readdirSync(join(src, 'projects')).sort().map(id => {
  const f = join(src, 'projects', id, 'direction.md');
  return existsSync(f) ? { id, ...publish(f, '/projects/' + id) } : null;
}).filter(Boolean);
const current = projects[projects.length - 1];
publish(join(src, 'projects', current.id, 'direction.md'), '/project/current');

page({ title: 'Studio', path: '/', palette: current.palette, html: `<p class="eyebrow">A study in colour and space</p>
<h1>Rooms that show what a colour combination feels like to live in.</h1>
<p>This site holds the written direction for each image. It is read by people and by assistants alike.</p>
<ul class="list"><li><a href="/guide">The Guide</a><span>How the project works. Read first.</span></li>
<li><a href="/project/current">Current project</a><span>${esc(current.meta.title)}</span></li>
<li><a href="/shells">Room shells</a><span>${shells.length} drafted</span></li></ul>
<p class="note">No images have been made under this process yet. Palette library and the library of approved work are not built.</p>` });

// One self-contained text file. An assistant's web reader may refuse to follow links it finds inside a page,
// so everything needed to make the current image is inlined here and every address is written in full.
const SITE = 'https://architectural-color-studio.vercel.app';
const abs = t => t.replace(/\]\(\/(?!\/)/g, `](${SITE}/`);
const strip = d => abs(d.body.trim());
const shell = shells.find(s => s.name === current.meta.shell) || shells[0];
const brief = `# Architectural Color Studio — everything needed to make the current image

This single file is complete. You do not need to open any other page.
Current assignment: ${current.meta.title} (${current.meta.version}). Guide version ${guide.meta.version}. Updated ${current.meta.updated}.

Read all three parts in order, then make the image using "The prompt" in Part 3 and deliver it as "Hand back" says.

Human-readable pages (optional): ${SITE}/guide · ${SITE}/project/current · ${SITE}/shells/${shell.name}

================================================================
PART 1 OF 3 — THE GUIDE
================================================================

${strip(guide)}

================================================================
PART 2 OF 3 — THE ROOM SHELL
================================================================

${strip(shell)}

================================================================
PART 3 OF 3 — THE DIRECTION FOR THIS IMAGE
================================================================

Palette values: ${current.palette.map(c => `${c.name} ${c.hex.toUpperCase()} (${c.role})`).join('; ')}.

${strip(current)}

================================================================
END. Nothing further needs to be read.
`;
writeFileSync(join(out, 'llms.txt'), brief);
writeFileSync(join(out, 'brief.txt'), brief);
page({ title: 'Current brief, complete', path: '/brief', html: `<h1>Current brief, complete</h1><p>The Guide, the room shell and the direction on one page, for assistants that can only open one address. Also as plain text at <a href="/llms.txt">/llms.txt</a>.</p><pre class="brief">${esc(brief)}</pre>` });
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
console.log('built', readdirSync(out, { recursive: true }).filter(f => /\.(html|md|txt)$/.test(f)).join(', '));

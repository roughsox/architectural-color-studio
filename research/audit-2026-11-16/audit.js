const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const dist = process.argv[2], out = process.argv[3];
const types = { '.html': 'text/html', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const resolve = p => { p = decodeURIComponent(p.split('?')[0].split('#')[0]); if (p === '/') p = '/index'; for (const c of [p, p + '.html']) { const f = path.join(dist, c); if (fs.existsSync(f) && fs.statSync(f).isFile()) return f; } return null; };
const srv = http.createServer((q, r) => { const f = resolve(q.url); if (!f) { r.writeHead(404); return r.end('nf'); } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); }).listen(4599, run);
async function run() {
  const pages = ['/', '/palettes', '/palettes/studio', '/palettes/trios', '/trios/1', '/trios/2', '/trios/3', '/palettes/materials', '/palettes/wada', '/palettes/werner', '/palettes/nippon', '/palettes/ridgway', '/guide', '/project', '/library', '/notebook'];
  const b = await chromium.launch(); const links = new Set();
  for (const [n, w, h] of [['phone', 390, 844], ['ipad', 820, 1180], ['desk', 1366, 1024]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const pg = await ctx.newPage();
    for (const u of pages) {
      const errs = []; const on = e => errs.push(String(e.message || e.text?.() || e).slice(0, 120));
      pg.on('pageerror', on); const con = m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); }; pg.on('console', con);
      const res = await pg.goto('http://127.0.0.1:4599' + u, { waitUntil: 'load' });
      const info = await pg.evaluate(() => {
        const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
        const taps = [...document.querySelectorAll('a,button,summary')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { t: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) }; });
        const small = taps.filter(t => t.h < 32 || t.w < 32);
        let minFont = 99, tiny = 0; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) { const t = walker.currentNode; if (!t.nodeValue.trim()) continue; const e = t.parentElement; if (!vis(e) || ['SCRIPT', 'STYLE'].includes(e.tagName)) continue; const f = parseFloat(getComputedStyle(e).fontSize); if (f < minFont) minFont = f; if (f < 12) tiny++; }
        const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map(h => +h.tagName[1]); let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skips++;
        return { overflow: document.documentElement.scrollWidth - innerWidth, height: document.documentElement.scrollHeight, h1: document.querySelectorAll('h1').length, imgsNoAlt: [...document.images].filter(i => !i.alt).length, imgs: document.images.length, smallTaps: small.length, smallEx: small.slice(0, 4), taps: taps.length, minFont, tiny, headingSkips: skips, noLabelBtn: [...document.querySelectorAll('button')].filter(x => !(x.innerText || '').trim() && !x.getAttribute('aria-label')).length, links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')) };
      });
      info.links.forEach(l => links.add(u + ' -> ' + l));
      console.log(n.padEnd(5), u.padEnd(20), res.status(), 'overflow', info.overflow, 'h', info.height, 'h1', info.h1, 'imgNoAlt', info.imgsNoAlt + '/' + info.imgs, 'smallTaps', info.smallTaps + '/' + info.taps, 'minFont', info.minFont, 'tinyText', info.tiny, 'hSkips', info.headingSkips, errs.length ? 'ERR ' + errs.join(' | ') : '', n === 'phone' && info.smallEx.length ? JSON.stringify(info.smallEx) : '');
      if (n !== 'desk' || ['/', '/trios/1'].includes(u)) await pg.screenshot({ path: `${out}/${n}${u.replace(/\//g, '_')}.png`, fullPage: !['/palettes/wada', '/palettes/ridgway', '/palettes/nippon', '/palettes/werner'].includes(u) });
      pg.off('pageerror', on); pg.off('console', con);
    }
    await ctx.close();
  }
  const broken = [...links].filter(l => { const h = l.split(' -> ')[1]; if (!h.startsWith('/')) return false; return !resolve(h); });
  console.log('internal links checked', links.size, 'broken', broken.length, broken.slice(0, 10));
  console.log('external', [...new Set([...links].map(l => l.split(' -> ')[1]).filter(h => /^https?:/.test(h)))]);
  await b.close(); srv.close();
}

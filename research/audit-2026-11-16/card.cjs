const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const dist = process.argv[2], out = process.argv[3];
const resolve = p => { p = decodeURIComponent(p.split('?')[0]); if (p === '/') p = '/index'; for (const c of [p, p + '.html']) { const f = path.join(dist, c); if (fs.existsSync(f) && fs.statSync(f).isFile()) return f; } return null; };
const srv = http.createServer((q, r) => { const f = resolve(q.url); if (!f) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(fs.readFileSync(f)); }).listen(4598, async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  for (const n of [1, 2, 3]) {
    await pg.goto('http://127.0.0.1:4598/trios/' + n); const sw = await pg.$$('.trio-page .tsw');
    const meta = await pg.$$eval('.trio-page .tsw', els => els.map(e => ({ c: getComputedStyle(e).getPropertyValue('--c').trim(), name: e.querySelector('.tname').innerText, nameColor: getComputedStyle(e.querySelector('.tname')).color, fs: getComputedStyle(e.querySelector('.tname')).fontSize, finFs: getComputedStyle(e.querySelector('.tfinish')).fontSize, finColor: getComputedStyle(e.querySelector('.tfinish')).color, finOp: getComputedStyle(e.querySelector('.tfinish')).opacity })));
    for (let i = 0; i < sw.length; i++) await sw[i].screenshot({ path: `${out}/card-${n}-${i}.png` });
    await (await pg.$('.trio-page .tcard')).screenshot({ path: `${out}/card-${n}.png` });
    console.log(JSON.stringify({ n, meta }));
  }
  await pg.goto('http://127.0.0.1:4598/'); await pg.waitForTimeout(1500); await (await pg.$('#feature')).screenshot({ path: `${out}/home-feature.png` });
  await pg.click('#surprise'); await pg.waitForTimeout(1200); await pg.click('[data-slot="0"]'); await pg.waitForTimeout(300); await pg.click('#naturals'); await pg.waitForTimeout(300);
  console.log('lab works:', await pg.$eval('.lab-score', e => e.innerText));
  await b.close(); srv.close();
});

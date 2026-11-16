import json, sys, re
import numpy as np
from PIL import Image
sys.path.insert(0, sys.argv[3])
from colour import srgb2lab, de2000, hx, tohex, contrast

trios = json.load(open(sys.argv[1]))
shots = sys.argv[2]
meta = {}
for line in open(shots + '/card-meta.txt'):
    if line.startswith('{'):
        d = json.loads(line); meta[d['n']] = d['meta']
rgbof = lambda s: [float(v) for v in re.findall(r'[\d.]+', s)[:3]]
for c in trios['combinations']:
    for i, x in enumerate(c['colours']):
        im = np.asarray(Image.open('%s/card-%d-%d.png' % (shots, c['number'], i)).convert('RGB')).astype(float)
        p = im.reshape(-1, 3); mean = p.mean(0); med = np.median(p, 0)
        tl = srgb2lab(hx(x['hex'])); L = srgb2lab(p[::37])[:, 0]
        m = meta[c['number']][i]
        print("Trio %d %-10s %-8s target %s  mean %s dE00 %4.1f | median %s dE00 %4.1f | L p5-p95 %2.0f-%2.0f (target %2.0f) | name text %s contrast %.1f:1, finish label %s at %.0f%% opacity" % (
            c['number'], x['name'], x['finish'], x['hex'], tohex(mean), de2000(tl, srgb2lab(mean)), tohex(med), de2000(tl, srgb2lab(med)),
            np.percentile(L, 5), np.percentile(L, 95), tl[0], m['fs'], contrast(rgbof(m['nameColor']), mean), m['finFs'], float(m['finOp']) * 100))

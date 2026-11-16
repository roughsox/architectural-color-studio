"""Audit of the notebook's room images: how much of each image sits near each palette colour,
how much is outside the palette, the overall colour cast, and the image shape."""
import json, sys
import numpy as np
from PIL import Image
sys.path.insert(0, sys.argv[4])
from colour import srgb2lab, hx, tohex

studio = json.load(open(sys.argv[1])); att = json.load(open(sys.argv[2])); imgdir = sys.argv[3]; out = sys.argv[5]
NEAR = 20  # CIE76 distance within which a pixel counts as "this palette colour"
thumbs = []
for g in att['groups']:
    pal = next(c for c in studio['combinations'] if c['number'] == g['palette']['number'])
    cols = pal['colours']; labs = np.array([srgb2lab(hx(c['hex'])) for c in cols])
    print('\n%s — %s' % (pal['name'], ', '.join('%s %s (%s)' % (c['name'], c['hex'], c['role']) for c in cols)))
    for a in g['attempts']:
        im = Image.open('%s/%s' % (imgdir, a['image'])).convert('RGB'); w, h = im.size
        small = im.resize((w // 4, h // 4), Image.LANCZOS); px = np.asarray(small).reshape(-1, 3).astype(float)
        L = srgb2lab(px)
        d = np.linalg.norm(L[:, None, :] - labs[None, :, :], axis=2); near = d.argmin(1); dist = d.min(1)
        shares = [float(((near == i) & (dist < NEAR)).mean()) * 100 for i in range(len(cols))]
        other = float((dist >= NEAR).mean()) * 100
        # hue-family share: pixels whose hue is within 25 degrees of the palette colour and reasonably chromatic, any lightness
        hue = np.degrees(np.arctan2(L[:, 2], L[:, 1])) % 360; C = np.hypot(L[:, 1], L[:, 2])
        fam = []
        for i, c in enumerate(cols):
            th = np.degrees(np.arctan2(labs[i][2], labs[i][1])) % 360
            gap = np.abs((hue - th + 180) % 360 - 180)
            fam.append(float(((gap < 25) & (C > 8)).mean()) * 100)
        mean_lab = L.mean(0); warm = mean_lab[2]
        # brightest 5%: what "white" looks like in the picture
        top = L[L[:, 0] >= np.percentile(L[:, 0], 95)].mean(0)
        print(' %-18s %4dx%-4d ratio %.3f  %-6s | near palette: %s | outside %2.0f%% | hue family: %s | mean L %2.0f, cast a %+.0f b %+.0f | brightest 5%%: a %+.0f b %+.0f' % (
            a['image'], w, h, w / h, a['verdict'],
            ' '.join('%s %2.0f%%' % (c['role'][:3], s) for c, s in zip(cols, shares)), other,
            ' '.join('%s %2.0f%%' % (c['role'][:3], s) for c, s in zip(cols, fam)), mean_lab[0], mean_lab[1], mean_lab[2], top[1], top[2]))
        t = im.copy(); t.thumbnail((400, 520)); thumbs.append((t, '%s %d %s' % (pal['name'], a['n'], a['verdict'])))
W = 5; H = (len(thumbs) + W - 1) // W
sheet = Image.new('RGB', (W * 410, H * 530), 'white')
for i, (t, _) in enumerate(thumbs): sheet.paste(t, ((i % W) * 410 + 5, (i // W) * 530 + 5))
sheet.save(out)
print('\norder on sheet:', [x[1] for x in thumbs])

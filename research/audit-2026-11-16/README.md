# Audit scripts, 2026-11-16

One-off scripts behind the measurements in `docs/AUDIT-2026-11-16.md`. Run from `apps/architectural-color-studio` after `npm run build`. They need Node with Playwright, and Python with Pillow and numpy.

| Script | What it does | Run |
|---|---|---|
| `audit.cjs` | Loads every page at phone, iPad and desktop width; reports errors, sideways scroll, small tap targets, small text, broken links; saves screenshots | `node research/audit-2026-11-16/audit.cjs $PWD/dist <output folder>` |
| `card.cjs` then `card_measure.py` | Renders each Trio card and measures its swatches against the stated values | `node …/card.cjs $PWD/dist <folder> > <folder>/card-meta.txt` then `python3 …/card_measure.py studio/palettes/trios.json <folder> research/audit-2026-11-16` |
| `rooms.py` | For each Notebook image: share of the picture near each palette colour, share outside the palette, colour cast | `python3 …/rooms.py studio/palettes/studio.json studio/notebook/attempts.json studio/notebook/img research/audit-2026-11-16 <sheet.jpg>` |
| `score_audit.cjs` | Re-runs the scheme score on every studio palette and every material pair, with material colours shifted within their own range, and on the Wada book | `node …/score_audit.cjs $PWD` |
| `colour.py` | Shared colour maths (sRGB to Lab, CIEDE2000, contrast) | — |

`rooms.py` is a rough whole-image measure: a pixel counts as a palette colour when it is within 20 (CIE76) of it. Light and shadow move pixel values, so the shares understate how much of a surface is "meant" to be that colour. It is good for comparing images with each other, not as an absolute.

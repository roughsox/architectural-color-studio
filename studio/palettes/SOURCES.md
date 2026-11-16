# Palette family sources

Each family is one JSON file in this folder. Adding a file adds a family to the site. `kind` is `combinations` (sets of colours) or `colours` (single colours for the studio to combine).

| File | Source | Data taken from | Licence |
|---|---|---|---|
| `wada.json` | Sanzo Wada, A Dictionary of Color Combinations | npm `dictionary-of-colour-combinations` 1.0.2 (Matt DesLauriers) | MIT; see `WADA-DATA-LICENSE.md` |
| `werner.json` | Werner's Nomenclature of Colours, 1821 | npm `color-name-lists` 3.34.0, list `werner`, digitised by Nicholas Rougeux (c82.net/werner) | CC0 as stated by that package |
| `ridgway.json` | Robert Ridgway, Color Standards and Color Nomenclature, 1912 | npm `color-standards-and-color-nomenclature` 1.1.0 (Davo Galavotti) | MIT; the book is public domain in the USA |
| `nippon.json` | Traditional Japanese colour names | npm `nippon-colors` 1.0.0 (Alex Sun) | MIT |
| `studio.json` | Combinations made in this studio | — | — |
| `trios.json` | Trios made in this studio; their cards are rendered to `trio-cards/` by `npm run cards` | — | — |
| `materials.json` | Natural materials, studio estimates | — | — |

The card typeface is Bodoni Moda (npm `@fontsource/bodoni-moda` 5.3.0), SIL Open Font License 1.1; see `site/fonts/OFL-bodoni-moda.txt`.

Licences are as declared by each package on 2026-11-15; they were read from the package metadata and files, not independently verified. All values are modern digital approximations, not measurements of the original books or dyes.

## Considered and not added

| Family | Why not yet |
|---|---|
| Le Corbusier, Polychromie Architecturale | The colours and name are licensed exclusively through Les Couleurs Suisse AG. Needs the owner's decision and possibly permission. |
| Kasane no irome (Heian layered colours) | No reliable open dataset found. Would need a scholarly source; values must not be invented. |
| Emily Vanderpoel, Color Problems; Boogert's watercolour manual | Public domain but not digitised as data. Would need to be sampled from scans. |
| Painters' rooms, period interiors, film palettes | Not existing datasets. Each would be built by the studio from sources and recorded as such. |

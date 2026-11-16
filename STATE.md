# Architectural Color Studio — state

_Updated 2026-11-16. Read this first. Keep it to one screen; history goes in `docs/LOG.md`._

## What it is

A workshop for the owner to play with colour and rooms, and a production line for social posts: **two slides, a room photograph, then its swatch card.** Live at https://architectural-color-studio.vercel.app (assistants read `/llms.txt`).

## How it works now

- **Palettes**: seven families (Wada, Studio, Trios, Werner, Ridgway, Japanese, Materials). **Trios** are the current format: three colours, each a finish (hero on the walls, upholstery, soft neutral).
- **Each trio has** a plain palette card (4:5, same paper grain on every swatch, names only), measured and downloadable from its page, and a one-line request to paste into the ChatGPT project.
- **The owner makes images in a ChatGPT project** using the instructions on /instructions (current: v2) and short commands such as `#213`.
- **The Notebook** (`studio/notebook/`) records every attempt with its verdict and the lessons (18 so far). It is the most important record in the project.

## Where things stand

- No finished piece yet; the Library is empty.
- Sage, Rose, Ivory: attempt 1 *closer*, attempt 2 *miss*. 
- **Current method (owner, 2026-11-16): a ChatGPT project with instructions (`studio/chatgpt/INSTRUCTIONS-v1.md`) and short commands (`#213`, `card #213`).** First results are the best so far (Notebook: Wada 213, 254). v2 (`INSTRUCTIONS-v2.md`: creative decisions vs fixed specifications, 4000 K / CRI 95+ light, camera, scale) is on the site at /instructions with a Copy button; test it against v1 on Wada 213 and 254. The per-trio prompts on the site are superseded by this.
- **Owner direction (2026-11-16): one main prompt that works for any palette**, not a prompt per palette. The per-trio room sheets and prompts on the site (v0.8) are the wrong direction; replace them with one main prompt once the owner has agreed its wording. Go at the owner's pace: play first, build only what has been agreed.
- The audit (`docs/AUDIT-2026-11-16.md`) lists what else to improve, in order.

## Open decisions

1. **The priority is great images from ChatGPT.** The site's purpose, the Guide, and any restructuring wait until that is settled (owner, 2026-11-16).
2. Studio palettes: adjust once the image method is settled; possibly a brief per-palette note that supplements the instructions, never competes with them. The materials score stays for now; whether the natural materials earn their place is open.
3. The Current project page stays as a playground.
4. AI disclosure on posts (platform rules not yet checked).
5. Where images live once the Library grows past a few dozen pieces.

## Working rules

See `AGENTS.md`. In short: `main` is the live site; checks run on every build; both accounts pull before starting and before pushing; never force-push.

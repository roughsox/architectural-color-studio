# Architectural Color Studio — state

_Updated 2026-11-16. Read this first. Keep it to one screen; history goes in `docs/LOG.md`._

## What it is

A workshop for the owner to play with colour and rooms, and a production line for social posts: **two slides, a room photograph, then its swatch card.** Live at https://architectural-color-studio.vercel.app (assistants read `/llms.txt`).

## How it works now

- **Palettes**: seven families (Wada, Studio, Trios, Werner, Ridgway, Japanese, Materials). **Trios** are the current format: three colours, each a finish (hero on the walls, upholstery, soft neutral).
- **Each trio has** a measured swatch card (download button on its page) and a **room sheet** (`sheet` in `studio/palettes/trios.json`) that describes the room completely. The prompt on each trio page (v0.8) is built from the sheet and follows OpenAI's own image-prompting guide.
- **The owner makes the image in ChatGPT**: new chat, attach only the card, paste the prompt, add nothing. Judge the first image with the five questions on the trio page. A miss changes the room sheet, not the chat.
- **The Notebook** (`studio/notebook/`) records every attempt with its verdict and the lessons (18 so far). It is the most important record in the project.

## Where things stand

- No finished piece yet; the Library is empty.
- Sage, Rose, Ivory: attempt 1 *closer*, attempt 2 *miss*. Prompt v0.8, the deeper sage and the room sheet are untested.
- **Current method (owner, 2026-11-16): a ChatGPT project with instructions (`studio/chatgpt/INSTRUCTIONS-v1.md`) and short commands (`#213`, `card #213`).** First results are the best so far (Notebook: Wada 213, 254). v2 (`INSTRUCTIONS-v2.md`: creative decisions vs fixed specifications, 4000 K / CRI 95+ light, camera, scale) is on the site at /instructions with a Copy button; test it against v1 on Wada 213 and 254. The per-trio prompts on the site are superseded by this.
- **Owner direction (2026-11-16): one main prompt that works for any palette**, not a prompt per palette. The per-trio room sheets and prompts on the site (v0.8) are the wrong direction; replace them with one main prompt once the owner has agreed its wording. Go at the owner's pace: play first, build only what has been agreed.
- **Branch `plain-swatches` (not merged, not published):** the trio card redrawn as the owner's option B: 4:5, flat colour with the same paper grain on every swatch, names only, no finishes or roles; trio pages list only names and values. Waiting for the owner to see it, and for Vercel's daily limit to reset. The per-trio prompt on those pages still assigns colours to objects and is to be replaced by the one main prompt once agreed.
- The audit (`docs/AUDIT-2026-11-16.md`) lists what else to improve, in order.

## Open decisions

1. Whether the four-colour Studio palettes are kept, recast as trios, or retired.
2. AI disclosure on posts (platform rules not yet checked).
3. Where images live once the Library grows past a few dozen pieces.

## Working rules

See `AGENTS.md`. In short: `main` is the live site; checks run on every build; both accounts pull before starting and before pushing; never force-push.

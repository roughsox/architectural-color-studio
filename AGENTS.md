# Architectural Color Studio — instructions for assistants

This repository holds one project and nothing else. Read `STATE.md` first, then the part of the project you are working on.

## Layout

| Path | What |
|---|---|
| `studio/` | The content: palettes (`palettes/*.json`), the Guide, the Notebook, projects, the experts (`desks.json`) |
| `site/build.mjs` | Builds the site from `studio/` into `dist/`; also checks the data and stops on errors |
| `site/style.css`, `site/site.js` | One stylesheet and one small script shared by every page |
| `studio/chatgpt/` | The ChatGPT project instructions, one file per version; the newest is shown on /instructions |
| `site/card.mjs` | The trio palette card (one SVG for the page and the download) |
| `scripts/cards.mjs` | Renders and measures the trio cards (`npm run cards`) |
| `docs/` | `BRIEF.md` (the owner's brief), `AUDIT-2026-11-16.md`, `LOG.md` (history), `archive/` (the first plan) |

## Build and check

- `npm ci`, then `npm run build`. The build refuses broken palettes and out-of-date cards.
- After changing `studio/palettes/trios.json` or `site/card.mjs`: `npm run cards` (needs Playwright with Chromium), then commit `studio/palettes/trio-cards/`.
- Before publishing, look at the changed pages at phone (390 px) and iPad (820 px) width.

## Publishing

- **`main` is the live site.** Vercel builds every push to `main` and publishes it. Pushes to other branches get a preview link.
- Do not create deployments by hand. The free plan allows 100 deployments a day.
- Group changes: one push per piece of work, not per edit.
- Each push to any branch is one deployment; on 2026-11-16 the 100-a-day limit was reached and Vercel silently skipped pushes. Push to `main` only (not also to a working branch), and after pushing check that the production deployment for that commit is READY before saying it is live.
- The owner's standing instruction: publish checked changes without asking first.

## Working together

- The owner uses more than one Claude account. Pull `main` at the start of a session and again before pushing; if it moved, merge it in. Never force-push, never rewrite history.
- Small checked changes go straight to `main`. Larger or experimental work goes on a short branch, is checked on its preview link, then merged into `main` and the branch deleted.
- Update `STATE.md` (one screen) before you finish; add a line to `docs/LOG.md` only for decisions.

## Content rules that came from mistakes

- Never assign a colour to built-ins or joinery in a prompt or on a page: the image maker builds them (Notebook lesson 18).
- Prompts describe things, not qualities; avoid "luxury", "magazine" and other staging words (Notebook, "What others have found").
- We are brainstorming until a method sticks (owner, 2026-11-16: "stop trying to save an archive of literally everything"). Don't log every image or remark; record only what works or is decided, briefly.
- Go at the owner's pace: discuss first, build only what is agreed. Follow-up prompts you suggest should be short and in plain language; the owner's own short requests have worked best.

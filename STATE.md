# Architectural Color Studio — state

_Updated 2026-11-16. Read this first. Keep it to one screen; history is in `docs/LOG.md`._

## What it is

A workshop for the owner to play with colour and rooms, and a source of inspiration posts: **two slides, a room photograph, then its swatch card.** The aim is inspiration, not photographic proof. Live at https://architectural-color-studio.vercel.app.

**The site shows Wada only** (other families' data kept in `studio/palettes/`; `shown` in `site/build.mjs`).

## How images are made now

- **Instructions v6** (`studio/chatgpt/INSTRUCTIONS-v6.md`, on /instructions): the owner's own v1, which made the Wada 213 living room first try, plus a short House paragraph and a `#123 dining room` command. Later versions (v2–v5, the alternatives) removed what made v1 work; kept for reference only. Don't add rules.
- Swatch cards: still open. The v1 card style is a starting point, not settled.

## What has been learned (details: Notebook lessons 1–27, `studio/chatgpt/OBSERVATIONS.md`)

- Short, natural follow-ups in the owner's words beat long engineered ones. Change a little at a time.
- Ask for things, not qualities; never name palette colours for art; say what to keep about light, not only what to remove.
- Follow-ups can't move furniture or architecture; get the layout right in the first image.
- Asking ChatGPT to audit its own room as a real space helps (lesson 27), but its words run ahead of its images.
- The first idea locks in: change the room (three directions, a different room type), don't repair it (lesson 28). A colour map gets painted on every surface (lesson 29).

## Next

1. **The House** (/house, data and images in `studio/house/`): a bright classical house set by the owner's favourite room (Wada 213 living room: pale blue panelling, cinnamon sofa, yellow chairs, shot straight on), renovated by a woman who loves Wada's book; her friend is the photographer. 10 rooms, 26 more candidate palettes (2–3 per room) picked by the studio; the owner picks one per room on the page (kept on their device, "Copy my picks"). Next: the owner's picks, then how to make each room (two voices, a short image prompt). Brainstorming: don't add rules or detail; don't archive everything.
2. Compare how many follow-ups each method needs to reach something shareable; fold what works into the next versions.
3. Later, once the method is settled: the first finished piece in the Library (room + card as two slides), then decide the site's purpose.

## Open decisions

1. The site's purpose, the Guide and any restructuring wait until the image method is settled (owner).
2. Studio palettes: adjust later; a short per-palette note may supplement the instructions, never compete. Materials score stays for now.
3. The Current project page stays as a playground.
4. AI disclosure on posts; where images live once the Library grows.

## How to work with the owner

Go at the owner's pace: discuss, then build only what is agreed. Be concise. Measure images when useful, but the owner's eye decides. Record the owner's ideas in their words in `docs/LOG.md`. See `AGENTS.md` for building and publishing (`main` publishes automatically; never deploy by hand).

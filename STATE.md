# Architectural Color Studio — state

_Updated 2026-11-16. Read this first. Keep it to one screen; history is in `docs/LOG.md`._

## What it is

A workshop for the owner to play with colour and rooms, and a source of inspiration posts: **two slides, a room photograph, then its swatch card.** The aim is inspiration, not photographic proof. Live at https://architectural-color-studio.vercel.app.

## How images are made now

- In **ChatGPT projects**, with Wada's `colors.json` as a project file and instructions from **/instructions** (Copy buttons there).
- **Leading method: "Design brief first", version 2** (`studio/chatgpt/ALTERNATIVE-design-brief-first-v2.md`, project "Architectural images alternate"). ChatGPT writes a short design brief, waits for "go", makes the image, then the owner refines it with short follow-ups in plain language. Commands: `audit` (imagine the whole room beyond the frame, check placements, improve) and `reset` (back to palette and brief, fix drift).
- **Also current: instructions v5** (`INSTRUCTIONS-v5.md`, project "Architectural images"): image straight away, same standards.
- **Best room so far:** the Wada 209 "Blue Salon" (Notebook, Wada 209 alternative group, attempt "final"), reached after about a dozen owner follow-ups ending in a self-audit prompt.

## What has been learned (details: Notebook lessons 1–27, `studio/chatgpt/OBSERVATIONS.md`)

- Short, natural follow-ups in the owner's words beat long engineered ones. Change a little at a time.
- Ask for things, not qualities; never name palette colours for art; say what to keep about light, not only what to remove.
- Follow-ups can't move furniture or architecture; get the layout right in the first image.
- Asking ChatGPT to audit its own room as a real space works best of all (lesson 27).

## Next

1. **Testing alt v2 on Wada 182** (Raw Sienna, Vandyke Brown, Deep Indigo; Notebook, Wada 182 group). Image 1 a miss, image 3 "quite impressed" after two follow-ups: grand, but the palette is still applied as a formula. The owner is now trying `audit` and `reset`. Log every image, misses included. ChatGPT keeps a Google Doc of each chat (brief + conversation) in the owner's Drive; read it with the Google Docs tool (chatgpt.com share links can't be read from here).
2. Compare how many follow-ups each method needs to reach something shareable; fold what works into the next versions.
3. Later, once the method is settled: the first finished piece in the Library (room + card as two slides), then decide the site's purpose.

## Open decisions

1. The site's purpose, the Guide and any restructuring wait until the image method is settled (owner).
2. Studio palettes: adjust later; a short per-palette note may supplement the instructions, never compete. Materials score stays for now.
3. The Current project page stays as a playground.
4. AI disclosure on posts; where images live once the Library grows.

## How to work with the owner

Go at the owner's pace: discuss, then build only what is agreed. Be concise. Measure images when useful, but the owner's eye decides. Record the owner's ideas in their words in `docs/LOG.md`. See `AGENTS.md` for building and publishing (`main` publishes automatically; never deploy by hand).

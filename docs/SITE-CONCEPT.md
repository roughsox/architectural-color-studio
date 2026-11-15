# Site concept — four pages, one shared source

_2026-11-15. Proposed from the owner's brainstorm; for the owner to react to before anything is built. Where this differs from WORKFLOW.md and ROADMAP.md, this is the newer thinking and those documents will be revised once it is agreed._

## 1. What changed

The first plan assumed the studio would call image models itself. The owner's direction is different and simpler to start:

- **ChatGPT makes the room images**, following written direction.
- **Claude owns the site, the direction, the measurements and the reviews.**
- **The owner picks the palette and approves.**

So the site's first job is to be the place where those three meet: one set of written instructions everyone works from, one current project everyone can see, and one library of what has been approved. Calling image models directly from the site remains possible later (§7) and nothing here blocks it.

## 2. One source, two readers

Everything the site shows is a plain file in this repository. The site is a well-designed view of those files; it holds no knowledge of its own.

- **People** read the pages.
- **Assistants** read the same content as plain text. Every page has a text twin at a predictable address (`/guide.md`, `/project/current.md`, `/palettes.json`) and one index file lists them all. Nothing important exists only as layout, an image of text, or a button.
- **Claude changes the site by changing the files.** A new direction, a review, an approval: each is a small commit with a date and an author, so the history of every decision is kept automatically.

```
apps/architectural-color-studio/studio/
  guide/GUIDE.md                    the process, for any assistant or person
  palettes/wada.json                348 combinations: number, names, exact values
  shells/<name>.md                  room shells, each reviewed once
  projects/<nnn>-<palette>-<room>/
    direction.md                    the written direction for this palette and room
    versions/v1/
      image.png                     the original, never altered
      source.md                     who made it, when, with what prompt
      measurements.json             colour readings by surface
      reviews/<desk>.md             one file per review desk
    revision-v2.md                  what to change next, and what must not change
    decision.md                     the owner's approval, or reason for rejection
```

## 3. Page one — Palettes

The 348 Wada combinations, as now. The starting point for every project.

- Each palette shows its colours large, with names and exact values.
- Filter by number of colours, by lightness (pale, mid, deep) and by temperature.
- Each carries a status: untouched, in progress, approved. Approved palettes show their finished image.
- A palette's own page adds a short character note ("soft and warm with one sharp cool accent") and the room shells that suit it. That note is the first written direction; it is what turns a palette into a room.
- One action: **Start a project with this palette.**

## 4. Page two — The Guide

The single reference for the whole project, written for ChatGPT but readable by anyone. One page, first principles, no history. Proposed contents:

1. **What we make.** A room and its swatches side by side; eye candy that is approachable but spectacular. One example.
2. **Who does what.** ChatGPT makes the room image from the direction. It does not make the swatch panel, does not approve its own work, and does not change the direction. Claude writes direction, measures and reviews. The owner decides.
3. **How to read a direction.** What each section means and which parts are fixed.
4. **Rules for every image.** Format (9:16), neutral daylight, straight verticals, no people, no text, calm architecture with at most one memorable feature, the palette carried by named surfaces, traces of life.
5. **What goes wrong.** The known failures, each with a one-line fix: amber cast, perfect symmetry, showroom scale, furniture blocking a hearth or door, cloned objects, glowing light with no source.
6. **How to hand an image back**, and what to state with it (the exact prompt used).
7. **How review works**, so a revision request is understood as a targeted change, not a new image.
8. **The room shells**, linked.

It is short enough to read at the start of every ChatGPT session. It has a version number; each project records which version it was made under.

## 5. Page three — Current project

One palette, one room. The working page.

**Top: the image.** The latest version, large, with the finished side-by-side beside it once a version passes. Earlier versions are one tap away, with any two comparable side by side.

**Direction.** The written direction for this palette and room: the shell, which colour goes on which surface and how much, the light, the camera, the traces of life, and the exact prompt for ChatGPT to use. For a revision, a short list of changes and a list of what must stay.

**Review desks.** Each expert has a desk: a small panel with a status (waiting, clear, issues), its findings, and whether each finding is measured or an opinion. Desks open at the stage where they have something real to judge:

| Stage | Desk | Judges |
|---|---|---|
| When a shell joins the library (once) | **Architect and builder** | Proportions, circulation, whether it could be built |
| Before any image | **Interior designer** | The direction: colour placement, furnishing, hierarchy |
| On each image | **Colour** | Measured readings by surface against the palette; cast |
| On each image | **Architect and builder** | Does the image match the shell; anything impossible |
| On each image | **Stylist** | Believable, restrained, lived-in, not obviously generated |
| On each image | **Fresh eyes** | Shown only the image: what colours and what room does a newcomer see |
| On the finished side-by-side | **Social editor** | Thumbnail, crop, legibility on a phone |
| Optional, on each image | **Independent view (ChatGPT)** | A second opinion from a different assistant, kept separate from the others |

**Summary.** One short panel reconciles the desks: what blocks, what to keep, and the revision direction (three changes at most).

**Decision.** Approve, revise, or reject. Approving moves the project to the Library.

## 6. Page four — Library

Approved work only. The cleanest page on the site.

- A grid of finished side-by-sides. Images only; no status, no controls.
- Opening one shows it full size, its palette, and downloads for each format.
- The record of how it was made (direction, versions, reviews) is one quiet link away, not on the page.
- The grid doubles as a preview of the social feed, so repetition between rooms is visible before posting.

## 7. How a project moves

1. The owner picks a palette. Claude proposes a shell and writes the direction.
2. The interior designer desk reviews the direction. The owner can read it and change anything.
3. ChatGPT reads the Guide and the direction, and makes the image.
4. The image arrives on the project page as V1.
5. Claude measures and runs the desks. The summary appears.
6. If changes are needed, ChatGPT gets a revision direction and makes V2. Three rounds at most; then the owner sees the best version and what is still wrong.
7. Once a version passes, Claude builds the swatch panel from the exact values and composes the side-by-side.
8. The owner approves. The project appears in the Library.

**The hand-off: two sites, no carrying (proposed 2026-11-15, to be tested).**

- **Claude's site (this one)** publishes the Guide and each direction as public text pages. ChatGPT reads its instructions there.
- **ChatGPT's site (the existing chatgpt.site address) becomes its outbox.** ChatGPT publishes each new image there at a public address, with a small manifest file listing every image: project, version, file address, the exact prompt used, date.
- **The owner's only job is to say "ready."** Told that a new image is ready, Claude reads the manifest, downloads the original from ChatGPT's site, stores it in the repository unaltered, measures it, runs the desks, and publishes the result and any revision direction on this site. Told that a revision direction is ready, ChatGPT reads it from this site and publishes the next version to its outbox.

What is proven: on 2026-11-15 Claude read ChatGPT's site and downloaded both of its images at full size. What is not yet proven: that ChatGPT can add a new image and a manifest to its site on request without the owner handling files, and that ChatGPT can read this site's public pages. Both are tested with one image before the site is built around them. Fallback if either fails: an upload button on the project page.

Reviews still happen when the owner opens a session with Claude, not instantly. Later, the site could request images from an image model directly and run reviews automatically.

## 8. Questions that shape the build

1. **Which rooms first** for the shell library? Proposed: living room, bedroom, library or snug, kitchen, entry, bathroom.
2. **Public pages.** The Guide, palettes and directions must be public for ChatGPT to read them. They contain nothing private. Uploads, reviews in progress and decisions can stay behind sign-in. Agreed?

## 9. Kept from the first plan

Drawn swatches, direction before pixels, neutral light, measured colour by surface, reviewers that do not see each other's work, three-round cap, nothing ever overwritten. The shell library replaces designing a new room for every palette.

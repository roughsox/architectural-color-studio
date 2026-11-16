# Architectural Color Studio — state

_Updated 2026-11-16. Read this first when resuming._

**Who works on this:** both of the owner's Claude accounts, directly on the `architectural-color-studio` branch (owner's direction, 2026-11-16: one place, seamless hand-over). Start each session by pulling the latest of this branch; finish by updating this file and pushing. No separate session branches, and the project stays in this repository.

## Where things stand

**Planning, plus a first readable slice.** The owner's working direction (2026-11-15): Claude owns the site and writes direction; ChatGPT makes room images from it without paid API use; images come back by a route still to be tested (ChatGPT's own site as an outbox, a shared ChatGPT link, or Google Drive). The four-page site in `docs/SITE-CONCEPT.md` is not built.

What exists: a four-page site skeleton built from plain files in `studio/` (`npm run build` → `dist/`): **Palettes** (a card per palette family with a description and an Open button; each family is one file in `studio/palettes/<id>.json` with its own page. Five families: Wada, 348 combinations; Studio combinations, empty, for combinations the studio makes on purpose under the rules in Guide §4; and three collections of single colours — Werner 110, Ridgway 1,117, traditional Japanese 250. Sources, licences and families considered but not added are in `studio/palettes/SOURCES.md`), **Guide** (v0.3, the process), **Current project** (stage tracker, image frame, and one desk per discipline from `studio/desks.json`; all desks are waiting) and **Library** (empty). `/llms.txt` is the whole project as one text file for assistants. Project 001 is a placeholder; no room has been decided and no image exists. The earlier room-shell and image-direction drafts were removed at the owner's direction and remain in git history.

**Public site (published 2026-11-15 with the owner's go-ahead): https://architectural-color-studio.vercel.app** — assistants start at `/llms.txt`. Vercel project `architectural-color-studio`, root `apps/architectural-color-studio`, build `npm run build`, output `dist`. Its production branch setting is `main`, where this app does not exist, so a push does **not** update the public site: after pushing this branch, create a production deployment of the branch through the Vercel tools. Other branches are skipped by the project's ignore-build rule. Sign-in protection was changed for this project only so the main address is public; individual deployment addresses still need sign-in.

| Document | Contents |
|---|---|
| `../../ARCHITECTURAL_COLOR_STUDIO_BRIEF.md` | The owner's brief |
| `docs/DISCOVERY.md` | Audit of the reference site and its two images, with measurements; provider research |
| `docs/VISION.md` | The product, five positions that differ from the brief, the quality bar |
| `docs/WORKFLOW.md` | Three architectures compared, the selected pipeline, the review panel, adjudication, caps |
| `docs/ARCHITECTURE.md` | Stack, records, provider interfaces, measurement, cost, security, what is connected today |
| `docs/ROADMAP.md` | Stages 0–4 with acceptance tests |
| `docs/SITE-CONCEPT.md` | **Newest thinking.** Four-page site (Palettes, Guide, Current project, Library), shared file format, ChatGPT makes images and Claude owns the site and reviews. Supersedes parts of WORKFLOW and ROADMAP once agreed |
| `research/measure_reference.py` | The script behind the measurements in DISCOVERY §3 |

Branch: `architectural-color-studio`. Do not merge into `main` without the owner's approval.

## The design in five lines

1. Swatches are drawn from the numbers, never generated. The room is generated.
2. The room is planned and reviewed as text before any image is paid for.
3. Light is specified neutral up front; colour is then measured by surface region, and what a viewer names is tested separately.
4. Reviewers work blind on different evidence, rank by comparison, are tested on known defects, and need a second model family to confirm anything blocking.
5. A revision replaces the current best only if it wins. Three rounds, a spending cap, then escalate.

## Owner direction (2026-11-15, brainstorm — not yet decisions)

Recorded in the owner's words; the planning documents have not been revised to match yet.

- "We should have essentially written project directions/guidelines for each color palette – room."
- Either "a library of architect-driven designs spelled out in a format that ChatGPT can read and understand", chosen per palette, "or we could just keep the architecture a bit more neutral, which might be the better idea."
- "I want it to feel approachable but spectacular."
- "I want the finished product to serve as eye candy on social media with a color swatch and a complete room side-by-side."
- Claude leads on design judgment for this project; ChatGPT reviews.
- Site should have four pages: a color palette page ("the current entire color palette could be the starting point"); "a page dedicated to ChatGPT reference for the project in general as a whole, explaining the process in an efficient and functional first principle manner"; "a current project page for the specific color palette and room… where the different expert pockets can exist and review the project at appropriate levels"; "a very clean nice Library of approved projects/images".
- Rebuild the site "in a format that both Claude and ChatGPT can read", owned by Claude, where "ChatGPT can follow direction on image creation". "Let's flesh out the concept a bit more first."
- Agreed to the room-shell library and to revising the plan around it.
- **No library of room designs.** "I'd rather just [the model] be able to intelligently figure out what room setting and general architecture makes sense for the image." Supersedes the shell-library idea agreed earlier the same day.
- The goal is not one good image: "a workflow that is rock solid for creating thousands of these images with a repeatable, professional workflow and end result in Library."
- Stay at the level of the project's skeleton; do not produce image prompts until asked.
- No paid image API for now. How ChatGPT and Claude pass work to each other is unsettled: ChatGPT's reader could open `/llms.txt` on this site but not follow it reliably; ChatGPT's own site can only be changed with Codex usage.
- Palettes should be organised as families: the current palette family "should have its own button that opens up that color palette", leaving "room to add more unique specific professional color palettes and looks and families", and "each color palette family could have a bit of a description."
- "I'm OK with building all of these" (the further palette families suggested) "and it might also be relevant to give the agent the ability to select/create new color combinations intentionally."
- Asked whether Claude can change the site once the process is settled. Answer given: not the existing chatgpt.site page (no access to its source or hosting); Claude can build and deploy a replacement from this repository.

## Open decisions for the owner

Nothing below has been assumed in a way that is hard to change, but 1–4 block Stage 0.

1. **Providers and budget.** Which image providers can you supply keys for (OpenAI, Google, Black Forest Labs or a reseller)? What monthly ceiling and per-Plate cap? Proposed: two image providers, two review-model families, $5 per Plate, under $25 for the Stage 0 bake-off.
2. **Drawn swatches.** Confirm the swatch panel is typeset from exact values with material texture, replacing the generated gold-foil cards. This changes the look of the reference's cards in exchange for accuracy.
3. **Output format.** Confirm the Plate: a 9:16 room beside a narrow swatch column in one 4:5 image, plus room alone, swatch card alone and a carousel pair. Which platform is primary?
4. **Palette scope.** Wada combinations only, or any palette you enter? Proposed: Wada library first, custom palettes allowed.
5. **Colour grading.** May the studio shift a surface's colour slightly after generation, within a cap and disclosed in the proof? Proposed: yes.
6. **Review panel.** Accept merging architect and builder into one seat and adding the cold viewer? Proposed: yes, revisit after calibration.
7. **Autonomy default.** Approve only the final proof, or also the concept before generation? Proposed: final only, with supervised mode available.
8. **House style.** Typeface direction, whether a name or mark appears on the Plate, how the Wada source is credited.
9. **Where records live** once the web studio exists. Proposed: its own database and storage, separate from the Calendar Home Hub's.
10. **Calibration photographs.** The reviewer tests need about 20 real interior photographs you have the right to use privately. Can you supply them, or should licensed stock be used?
11. **AI disclosure.** Whether exports carry a note or metadata saying the room is generated. Platform rules vary and have not been checked.

## Questions for the independent reviewer

Challenge the design, not the wording. In particular:

1. Is drawing the swatch panel the right call, or does it lose something the generated cards had that matters more than accuracy?
2. Is "reads as the palette" (regions, relationships, blind read-back) a defensible standard, or a way of excusing drift? Are the proposed gates the right ones?
3. Do the independence measures in WORKFLOW §3 actually produce independent reviews? Where would the panel still agree with itself wrongly?
4. Is merging architect and builder a loss?
5. Is architecture B over-built for one person's studio? What could be cut from Stage 1 without weakening the result?
6. Is rejecting the 3D-first route premature?
7. Which acceptance tests in ROADMAP are unmeasurable as written, or could pass while the Plate is still poor?
8. What failure is nobody checking for?

## Known limits of this planning pass

- No image was generated and no provider was called. All provider statements are desk research and are flagged as such.
- The reference site was inspected from outside only. Its source, storage and export functions were not examined.
- Measurements of the reference images used hand-placed rectangles, not segmentation.
- Cost figures are estimates built on third-party prices.
- The brief asks for documents at `docs/` in the repository root. They are under `apps/architectural-color-studio/docs/` because the repository's rules keep each application self-contained. `AGENTS.md` has not been changed and does not yet mention this project; it is shared with other branches and needs the owner's say-so.

## Checkpoint log

- **2026-11-15 — Planning.** Reference audited, design proposed, documents committed for review.
- **2026-11-15 — Site skeleton.** Four pages with palettes, desks and an empty library; room shells and image direction removed. Checked at 1280 and 390 px.
- **2026-11-15 — First readable slice (superseded).** Guide v0.1, bay-window sitting room shell, direction for 001 (Wada #231), static builder. Checked locally at 1280 and 390 px: all pages load, no sideways scroll. Published; all pages and plain-text twins confirmed to load without sign-in. Not yet tested: ChatGPT reading the site, and any route for images to come back.
- **2026-11-16 — One shared branch.** Both Claude accounts now work directly on this branch; `AGENTS.md` (on `main`, `calendar-foundation` and here) points new sessions to it. A mistaken copy into `roughsox/Live-sites` was withdrawn unmerged (PR #4 closed).

---
title: The Guide
version: 0.6
updated: 2026-11-16
status: draft, awaiting owner approval
---

# The Guide

How Architectural Color Studio works, for any assistant or person taking part.

## 1. What we make

One image for social media: **a complete room and its colour swatches, side by side.** The room shows what a colour combination feels like to live in. The swatches state the colours exactly.

The feeling to hit is **approachable but spectacular**: a room a person could plausibly own, made memorable by confident colour. Eye candy that survives a second look.

The aim is a repeatable, professional process that can produce a large library of these, each made the same way.

## 2. The stages

Every piece moves through the same stages, in order. Nothing is skipped.

| Stage | What it means |
|---|---|
| **Queued** | A palette has been chosen |
| **Directed** | The owner has picked a room idea, it is written down, and the experts who speak before the image are clear |
| **Requested** | The image maker has been asked for the image |
| **Received** | The original image is stored, untouched |
| **Reviewed** | The experts have judged it: pass, or one short revision |
| **Approved** | The owner has signed off |
| **In the library** | The finished side-by-side is published with its record |

A revision sends a piece back from Reviewed to Requested. Three rounds at most; then the owner sees the best version and what is still wrong.

## 3. Who does what

| Who | Role |
|---|---|
| **Owner** | Decides at three moments: **choose the palette** (Queued), **pick a room idea** (Directed), **approve the piece** (Approved). Everything else is the studio's job. |
| **Studio lead** (Claude) | Runs the process, keeps the site, writes direction, measures, reviews. |
| **Image maker** (ChatGPT) | Makes the room image from the written direction. |

The owner's part should be the fun part. Questions to the owner come as a short choice, never a form.

## 4. Palette families and new combinations

Colour comes from **palette families**. There are two kinds:

- **Combinations**: ready-made sets of two to four colours, such as the Wada family. A project can start from one directly.
- **Colour collections**: single named colours, such as Werner, Ridgway and the traditional colours of Japan. These are raw material.

A third kind, **Natural materials**, holds the colours a room brings with it: wood, stone, clay, plaster, fibre, metal, planting and sky. A material is never one colour, so each is a range (light, typical, dark) with notes on texture and ageing, and is tagged inside, outside or both. The values are studio estimates until they are measured from real photographs. Materials are not palette colours; palettes are chosen to live with them.

The studio also **invents its own palettes**, unprompted: one at a time, or as a **series** with a theme (for example *Daylight hours*: one house through one day). The Colour specialist makes them. The owner does not have to describe anything.

**How a studio palette is made**

1. **Start from a point of view**: a light, a place, a material, a moment. It becomes the palette's name and its one-sentence intent.
2. **Give every colour a job.**
   - **Field**: the big, quiet colour that covers most surfaces.
   - **Weight**: the darkest colour, used in small, low, solid amounts to anchor the room.
   - **Accent** (optional): the one colour the eye goes to.
   - **Bridge** (optional): ties two of the others together.
3. **Choose only real colours.** Every colour comes from one of the families and keeps that family's name and exact value. No invented colours. The same name can carry different values in different families, so each colour names its family.
4. **Pass the measured rules.** The site checks these on every build and refuses a palette that fails:
   - two to four colours; one Field, one Weight, at most one Accent and one Bridge;
   - Field and Weight at least **30** apart in lightness, so the room never goes flat;
   - every pair of colours at least **15** apart (CIE colour difference), so no two read as the same;
   - at most **one loud colour** (strength 45 or more).
5. **Record it** in the Studio family with its date, its maker and its series. Existing palettes are never altered; a variation is a new entry.

A colour is always cited with its family, because the same name can carry different values in different families.

## 5. The room is decided per palette

There is no catalogue of rooms. For each palette the Architect proposes two or three kinds of room that suit that combination, with the reasoning, and the owner picks one. The architecture stays calm so the colour carries the image.

## 6. The experts

Eight experts sit at the studio table. Each speaks at the stages where it has something real to judge, without seeing the others' opinions first, and adds a short note to the project in order. Notes report findings rather than scores.

| Expert | Speaks at | Judges |
|---|---|---|
| **Studio lead** | Every stage | Opens each stage, reconciles the experts, issues a pass or one short revision |
| **Colour specialist** | Queued, Reviewed | How the colours relate in lightness, strength and temperature; then measured colour on each surface of the image |
| **Architect** | Directed, Reviewed | Two or three room ideas for the owner to choose from; proportions, openings, circulation; then whether the image shows that room |
| **Builder** | Directed, Reviewed | Whether the room could be built. Advisory |
| **Interior designer** | Directed, Reviewed | Where each colour goes and how much; furnishings; hierarchy |
| **Photographer** | Directed, Reviewed | Neutral daylight, camera height and lens, where the eye lands; then whether it looks photographed |
| **Stylist** | Reviewed | Believability and restraint: lived in, not staged |
| **Composition editor** | Reviewed, Approved | The room and swatches side by side as a social post on a phone |

Every finding says whether it was **measured** or is the expert's **judgment**. Building advice is advisory and is never a claim about any building code.

## 7. Schemes: paint colours and natural materials

A room is never only paint. Every palette becomes a **scheme**: its paint colours (two to four) plus **two natural materials** from the Materials family, one **surface** (wood, stone, clay, plaster) and one **touch** (fabric, leather, metal). Fabrics take either a paint colour or a natural fibre. Plants are always allowed for and never chosen.

The site scores every scheme before any image exists. The rules are established colour-design practice, made measurable (CIE Lab, the same maths the swatches use):

1. **Echo or contrast, never a near-miss.** A material either matches a paint colour closely (difference 6 or less: it carries that colour) or stands clearly apart (13 or more). In between looks like a mistake.
2. **Materials stay quieter than the accent.** A material may not be stronger than the accent colour.
3. **Shared undertone.** A coloured material sits within 70° of hue of the field or the weight; a neutral material is safe but scores lower, because it adds nothing.
4. **Two materials, two depths.** The surface and touch materials differ clearly, and ideally sit at different lightness.
5. **A full ladder from light to dark.** Across paints and materials, lightness spans at least 50 points with no large empty step.

Rules 1, 2, 4 and 5 can cost points; the rest of the score rewards undertone affinity, an even light-to-dark ladder and depth between the materials. **85 or more: cohesive. 70–84: works with care. Below 70: fights itself.** A studio palette needs 85 to be published. On the home page the owner can swap either material or ask for other naturals, and the score updates as they play.

## 8. The sit-down: everything before the image

As much work as possible happens before any image is made. Once the owner has picked a room idea, all eight experts hold a **sit-down** and argue it out. It is recorded in the project folder as `sit-down.md` and ends in `prompt.md`, the one prompt for the first image.

1. **Opening positions.** Each expert states, in three sentences or fewer, what the image must get right from their seat:
   - Architect: the room, its proportions and openings.
   - Builder: construction details that must be true.
   - Interior designer: where each paint colour and material goes, and roughly how much (field about 60%, weight 10–15%, accent 5–10%).
   - Colour specialist: exact values and what will make them drift.
   - Photographer: light, time of day, camera height and lens.
   - Stylist: signs of life, and what to leave out.
   - Composition editor: how the room reads beside its swatches on a phone.
2. **Challenges.** Every expert must raise at least one conflict with another expert's position, and that expert answers: accept, adjust, or defend with a reason.
3. **Resolution.** The Studio lead records every decision. Anything that cannot be settled goes to the owner as one short choice.
4. **The prompt.** One prompt, built only from what was agreed, in fixed parts: *Subject* (one sentence), *Architecture*, *Colour placement* (each colour by name and exact value, its surface and share), *Materials*, *Light*, *Camera*, *Styling*, *Leave out*, *Format*. Plain language, about 250 words at most.

The experts are one model writing in eight roles. The value of the sit-down is that every concern is forced into the open and resolved before an image is paid for, not that the voices are independent.

## 9. Standards every image must meet

1. Vertical room image, with no text, people or logos in it.
2. Neutral daylight, so the palette colours are not shifted by warm light.
3. Looks photographed, not rendered.
4. Calm architecture; the colour is the spectacle.
5. Each palette colour on a clearly readable surface; the scheme's two materials present; no colour beyond the scheme except plants and small signs of life.
6. A home, not a showroom: ordinary scale, usable layout, nothing blocking doors or windows.
7. Not symmetrical, not cloned, and with signs that someone lives there.

## 10. The swatch

The swatch panel is drawn from the palette's exact values, not generated as an image, so it is the one part of the piece that is exactly right.

## 11. The record

Nothing is overwritten. Every version of every image, every expert's note and every decision is kept, so any piece in the library can be traced back to how it was made.

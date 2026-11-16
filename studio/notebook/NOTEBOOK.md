---
title: Notebook
updated: 2026-11-16
status: working notes, not final
prompt_version: 0.5
---

# What the studio is learning about making images

Working notes from making room images in ChatGPT with a palette card attached. The prompt below is the current best attempt, not the final one. Each lesson says what showed it.

## Taste notes (from the owner's references, 2026-11-16)

Seven rooms the owner loves, mostly posts pairing a three-colour swatch card with a room. What they share:

- **Three colours, each a finish.** One hero colour drenched over the walls and the built-in joinery (emerald plaster, peacock panelling, graphite cabinetry), one upholstery colour (amber or tobacco leather, rose velvet), one soft neutral (cream, parchment, putty).
- **The hero colour is usually deep and saturated, and it dominates.** The opposite of the studio's earlier assumption that the lightest colour covers most of the room.
- **The same house style every time.** Dark wood floors; brass lighting (sconces, picture lights, a chandelier); panelling or arched built-ins with softly lit shelves; one centred focal wall, shot straight on; a light sofa or bed against the coloured walls.
- **Warm, golden lamplight.** What the owner dislikes is a filter over the whole image, not warm light.
- **Restrained, classic luxury.** Few accessories, nothing over-matched.
- **The swatch card is half the post.** Textured finishes (plaster, leather) with engraved serif names.

The references are other people's posts, so they are kept out of the site; only these notes are recorded.

## The working prompt for trios (v0.5)

Open a trio from **Palettes → Trios**, tap **Download card**, start a new chat, attach the card, then paste (each trio page has this with a Copy button). Before 16 November the cards were screenshots and their textures shifted some colours (Sage, Cognac and Ink most); attempts from then on use the measured download.

```
Design and photograph the room this palette card describes (image attached).

Use the three colours as their finishes: the top colour on the walls and the built-in joinery, the middle colour for the main upholstered pieces, and the bottom colour as the soft neutral for the sofa or bed, curtains and ceiling.

House style: dark wood floors, brass lighting (wall sconces, a picture light or a chandelier), classic panelling or arched built-ins with softly lit shelves, and one centred focal wall. Restrained, timeless luxury: few accessories, nothing over-matched.

Light: warm, golden lamplight with soft daylight from a tall window.

A photorealistic photograph for a high-end interiors magazine, shot straight on. Vertical 4:5. No people or text.
```

## The earlier prompt for four-colour studio palettes (v0.4)

Start a new chat, attach a screenshot of the palette card, then paste:

```
Design a luxurious, intentional room for the colour palette in this image, as if by an expert interior designer. Treat the palette card — its name, sentence and materials — as the brief, and choose whichever room type suits this palette best.

Give the room real architectural character and one clear focal point. Use the palette with confidence, so every colour is recognisable and has a reason to be where it is, and make sure things that touch contrast enough to stand apart.

Light it naturally and beautifully: soft daylight through a window and a few lamps already on. Warm and inviting, but colours must stay true — never filtered or orange.

A photorealistic photograph worthy of a high-end interiors magazine. No people or text. Vertical 4:5.
```

## Optional: ask it to review itself

Add to the end of the prompt. Its scores are generous, so treat them as a first filter, not the verdict.

```
After creating the image, review it honestly as a demanding design editor, scoring each from 1–10:
1. Palette — every colour recognisable, used with intention
2. Design — one clear idea, real architectural character, feels expert-designed
3. Contrast — things that touch stand apart
4. Light — natural, beautiful, colours true (not orange or filtered)
5. Realism — looks like a real photograph, not AI
6. Restraint — no generic filler or cluttered styling

Be strict: 7 means good, 9 means magazine-ready. If any score is below 8, say what's wrong in one line each and create an improved version that fixes the lowest scores. Repeat until every score is 8 or more.
```

If it stops after the scores, reply **continue**.

## Follow-ups that work

Short, and about taste rather than technique, in the same chat:

- *Make it look more luxury and intentional, as if designed by an expert.*
- *Feel free to try a different room type.*
- *Calmer, fewer accessories.*
- *Show more of the room.*
- *A touch warmer and cosier* / *a touch less orange.*

If an image is far off, start a new chat instead of correcting it.

## Lessons so far

1. **Set a standard, not a list of rules.** A one-line follow-up ("more luxury and intentional, as if designed by an expert; try other room types") beat every long prompt. The more structure a prompt has, the more the image becomes a demonstration of the structure: each rule is performed, none of it is designed. A planning prompt with a 9/10 target per category produced the most box-ticked image yet. *Attempts 5 and 7; Emerald Sofa 1.*
2. **Architecture matters more than the room type.** Letting it choose the room helped (a bedroom suited Plum Drench), but a living room worked too once it had real architecture: an arched window, arched built-ins, a beamed ceiling and one focal point. The early living rooms failed because they were furniture crops with no structure. *Attempts 6, 7 and 8.*
3. **Things that touch must contrast.** A purple sofa on a purple rug against purple walls reads as one block. *Attempts 1 and 2.*
4. **Respect the palette's roles.** The pale field colour was missing from the first image entirely: every surface sat in the dark half of the palette (measured lightness 18–51 against a field of 73). *Attempt 1.*
5. **Don't over-correct.** Taking colour away from the big pieces turned the palette into a few accessories in a grey room. *Attempt 3.*
6. **Describe light as a moment, not as fixtures.** Listing "cove lighting, lamps, fire" made it show each one off; the ceiling glow looked forced. "Soft daylight and a few lamps already on" reads as natural. *Attempts 5 and 7.*
7. **Warm, but not filtered.** Pure neutral white looked clinical; a warm filter over the whole image turned the walls salmon. The owner's references show warm, golden lamplight is wanted: the problem is a filter, not warmth. *Attempts 4 and 5; taste notes.*
8. **Edit for taste, restart for technique.** Same-chat follow-ups about taste improved the image; same-chat fixes to lighting just laid a filter over it. *Attempt 5.*
9. **Read the palette's own sentence.** "Lifted by one mustard throw" was ignored when the prompt described colours itself. Pointing it at the palette card as the brief fixed it. *Attempts 2 and 6.*
10. **Expect to choose, not to get it first time.** About one in two or three attempts is good; regenerating and picking beats repairing.
11. **Asking it to review itself helps, even loosely.** A general "review your own work and improve it" produced one of the best results; the scorecard is a stricter version to try next. *Attempt 8.*
12. **A material without a scale becomes a feature.** Listed as one of two materials, with the dark paint colour named "Walnut Shadow", walnut became a whole bookcase and, in another attempt, a wall of planks. Palette cards now say how each material is used ("Walnut — in small doses: one table, frames or a single piece of furniture"), and paint colours may no longer be named after materials. *Emerald Sofa 1.*

## Retired

- **The planning prompt** (plan the room, describe a 9/10 per category, then create): retired 2026-11-16 after Emerald Sofa 1. It turned every category into a box to tick. Planning belongs in the studio's sit-down, not in the image prompt.

## Still to work out

- Whether trios with prompt v0.5 hit the standard more often: three trios, three generations each, to get a hit rate.
- Whether the studio's four-colour palettes should be recast as trios.
- Generic styling it keeps reaching for (hydrangeas, candles on a tray, landscape paintings) without naming them in the prompt.
- How the image gets from ChatGPT to the site, and how the studio's review (measured colour, the experts) fits after it.

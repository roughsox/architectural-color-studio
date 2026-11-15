# Vision — Architectural Color Studio

_2026-11-15. Proposed; awaiting owner and independent review. Evidence is in DISCOVERY.md._

## 1. The product in one paragraph

You choose a colour combination. The studio returns a finished **Plate**: a photograph-grade room that makes those colours feel like somewhere you could live, beside a swatch panel that states the colours exactly. With it comes a one-page proof of why the studio believes the Plate is good, what it measured, what its reviewers argued about, and what it is unsure of. You approve, ask for a change in a sentence, or reject. Everything between brief and proof runs without you.

The reference site is a notebook for reviewing images made elsewhere. This is the studio that makes them.

## 2. Five positions that differ from the brief or the reference

These are the first-principles conclusions. Each is a proposal the owner can overrule (see STATE.md).

**1. The swatch panel is drawn, never generated.** The reference's generated swatch cards miss their targets by up to ΔE00 17 (DISCOVERY §3). The studio typesets the panel from the palette's numbers, with real type, and adds paper, plaster or linen texture as a lightness-only layer that leaves the colour exact. This removes an entire class of failure for almost no cost, and it is the one part of the Plate that can honestly be called precise.

**2. A palette is a material schedule, not a pixel target.** A pink wall in a real photograph is hundreds of pinks. The honest claim for the room is "this room *reads as* the palette under stated light", verified three ways: what was measured on each surface, how the colours relate to one another, and what a viewer who has not been told the palette names. The exact claim is carried by the swatch panel. Stating which claim is which is the product's integrity.

**3. Design the room before spending on pixels.** The reference's worst flaw, a sofa across the hearth, is a planning error that a written room specification would have exposed for free. The studio writes a plan (dimensions, furniture, clearances, light, where each colour goes and how much) and has it reviewed before any image is generated. Most architectural review happens here, where evidence exists, rather than as speculation about one image.

**4. Reviewers are instruments, not characters.** Six personas run on one model looking at one image will largely agree with each other and with the first opinion they hear. Independence has to be engineered: reviewers do not see each other's work, see different evidence, are tested on images with known defects, rank rather than score, and have their blocking claims checked by a different model family before anyone acts on them. The brief's six disciplines are all kept as rubrics (WORKFLOW §3).

**5. The pipeline comes before the dashboard.** The first build is a pipeline that produces Plates and proof pages as files. The studio interface is built once the images deserve one. The reference already shows what a good quiet interface looks like; what it lacks is the work.

## 3. The experience

**Brief (under a minute).** Pick a palette from the Wada library or enter your own. Optionally a room type, a mood in a sentence, reference images, constraints ("no fireplace", "small city flat"). Every field but the palette has a sensible default. "Surprise me" is a valid brief.

**While it runs (10–20 minutes, unattended).** A single line of status. No controls. If you watch, you see the plan, then candidates arriving, then the champion improving. You are interrupted only for the two reasons in WORKFLOW §7.

**The proof.** One page, image first:

- the Plate at the size it will be seen on a phone, then full size;
- a confidence band (High / Medium / Low) with its reasons in one sentence each;
- the colour evidence: per surface, target beside measured, with the light it was measured under;
- what changed between versions, shown as before and after;
- the one or two things reviewers disagreed on and how it was settled;
- what was not checked.

**Decision.** Approve, revise with a sentence, or reject. Approval freezes the Plate and its record. Nothing is ever deleted or overwritten; any version can be reopened and branched.

**Series.** Queue several palettes in the evening; review a contact sheet of proofs in the morning. A series shares a house style so a feed looks like one hand made it.

## 4. The Plate

Named for the plates of a colour book.

- **Room** — a 9:16 vertical photograph. Used whole for Stories and covers.
- **Swatch panel** — a narrow column: each colour as a generous chip in a real material texture, its name, its hex value, and its role in the room ("walls", "seating", "accent").
- **Diptych** — room and panel side by side in one 4:5 image (1080 × 1350). A 9:16 room at that height is 759 px wide, leaving a 321 px panel: the two formats nest without cropping either. This is the hero output.
- **Also exported** — room alone, swatch card alone (4:5), a two-slide carousel pair, and the audit record.

Whether a 321 px panel stays legible on a phone is a Stage 1 test, not an assumption. If it fails, the fallback is the carousel pair.

## 5. The quality bar

Adjectives are not criteria. Each line below is something a reviewer can point at or an instrument can measure. Numbers marked † are starting hypotheses to be calibrated in Stage 0 against real images and the owner's eye, then frozen.

### It reads as the palette

| Criterion | Pass looks like | Fail looks like (reference room) |
|---|---|---|
| Swatch exactness (measured) | Every chip within ΔE00 1.0 of target in the exported file; within 2.0† after a JPEG round trip | Generated cards at ΔE00 3–17 |
| Surface colour (measured) | Lit midtones of each palette surface within ΔE00 6† of target, hue within 8°† | Walls 26° toward orange; sofa ΔE00 20 |
| No colour cast (measured) | All palette surfaces do not share one hue error; a white or neutral object in the scene is neutral within ΔE00 4† | Uniform amber wash |
| Relationships hold (measured) | Lightness order of the palette colours is preserved; hue gaps between them within 10°† of the palette's | Blue collapsed to grey, so a three-colour scheme reads as two |
| Blind read-back (perceptual) | A reviewer shown only the room at phone size names each palette colour in the right hue family | — |
| Proportion (measured) | One colour clearly leads, the strongest is the smallest: roughly 60/30/10, by masked area | Acceptable in the reference |
| Restraint | Palette colours, at most two supporting neutrals, one natural material. No uninvited fourth colour above 3% of the frame | Acceptable in the reference |

### It could be built and lived in

| Criterion | Pass looks like | Fail looks like |
|---|---|---|
| Use | Every seat faces something: a fire, a view, another seat. Nothing blocks a door, hearth or window | Sofa across the hearth |
| Circulation | A clear route about 90 cm wide from the entry to each seat; 40–45 cm between sofa and table | Furniture islands with no way in |
| Scale | Door about 2.0–2.1 m, seat height about 45 cm, ceiling 2.6–3.2 m unless the brief says grand | A 4 m salon when the brief says approachable |
| Construction | Mouldings meet at corners; windows have reveals and sills; every light has a source and every source has a fixing | Cove glow with no cove |
| Geometry | Verticals vertical within 0.5° (measured); legs meet the floor with contact shadows; no merged or melted joints | Floating furniture, warped fixtures |

Dimensions are common residential practice, used as review cues. They are not code compliance for any jurisdiction and the product never says they are.

### It looks photographed, not rendered

| Criterion | Pass looks like | Fail looks like |
|---|---|---|
| One light story | A dominant source with a direction and a named colour temperature; shadows agree with it; artificial light is secondary | Even glow from everywhere |
| A photographer stood here | Eye height 1.2–1.4 m, moderate lens, a slightly off-axis or one-point view chosen for a reason | Dead-centre, ceiling-height, ultra-wide |
| Asymmetry | At most one mirrored pair in the room | Paired chairs, paired niches, paired sconces, paired curtains |
| Evidence of life | Two to four specific traces: a creased throw, a book left open, a chair pulled out, worn leather on one arm | One of every prop, equally spaced, all new |
| Variety | No object repeated identically; plants of different species and heights | Uniform plants, cloned cushions |
| Material truth | Fabric has weave and weight; plaster has hand; wood grain does not tile; highlights are not clipped | Plastic fabric, repeating grain |
| Aspiration within reach | A room a design-literate homeowner could plausibly finish, with one thing they covet | A hotel lobby |

### It works as a post

| Criterion | Pass looks like |
|---|---|
| Thumbnail test | At 150 px wide the palette and the room type are both still obvious |
| Format | Exact pixel dimensions for each export; nothing important inside platform interface zones |
| Type | Names legible at phone size (measured: rendered cap height and contrast ratio); real fonts, never generated lettering |
| Hierarchy | Eye goes to the room first, the swatches second, the names third |
| No tells | No text, logos, watermarks or people in the room image |

### The standard for "done"

A Plate is ready for the owner when every measured gate passes, no reviewer has an unresolved blocking finding, and the champion has beaten every challenger in blind comparison. A Plate is *good* when the owner, shown it beside the reference room without labels, prefers it. That second test is the only one that ultimately counts, and the roadmap measures it directly.

## 6. What the studio will not claim

- That a room pixel equals a paint colour. Screens, cameras, compression and light all intervene.
- That a model's opinion is a measurement. Every statement in a proof is tagged *measured*, *observed by a reviewer*, or *inferred*.
- That a room meets a building code.
- That a check ran when it did not. Each proof lists the checks that were skipped or unavailable.
- That the hex values are Wada's inks. They are a digital transcription, credited as such.

## 7. Not in scope

Posting to social platforms, floor plans or construction drawings, paint-brand matching, video, and a public multi-user product. The studio is a private tool for one owner until decided otherwise.

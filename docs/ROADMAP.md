# Roadmap

_2026-11-15. Proposed. Each stage ends in a checkpoint the owner reviews. No stage starts until the one before it passes its tests. Thresholds marked † in VISION are set in Stage 0 and frozen for the stages after._

## Before anything is built

- The owner and the independent reviewer read these documents.
- The open decisions in STATE.md are answered, at least 1–4.
- The owner provides keys for the chosen providers and a spending ceiling.

## Stage 0 — Evidence

Purpose: replace every assumption in these documents that can be replaced with a measurement. Small scripts and a results note, no product.

| Work | Acceptance test |
|---|---|
| **Colour maths** as a tested module | Matches the published CIEDE2000 reference pairs to 4 decimal places |
| **Provider bake-off**: 6 fixed briefs (two-, three- and four-colour palettes; a small room, a large room, a kitchen) × each connected provider × 4 images, same plan text | A results table per provider: palette error, share of images with a blocking defect, cost and time per image, and the owner's blind top picks. A primary and a fallback provider are named from the data. Budget under $25 |
| **Segmentation trial** on the bake-off images | On 30 hand-checked surfaces, the mask-quality test accepts at least 90% of good masks and rejects at least 90% of bad ones. If not, the measurement design is revised before Stage 1 |
| **Calibration set**: about 20 professional interior photographs the owner has the right to use for testing, 20 generated rooms with catalogued defects, 10 clean images with defects added | Set assembled, each image labelled with its known defects |
| **Reviewer calibration** on that set | Each seat's catch rate and false-alarm rate measured. Target: catches at least 80% of planted blocking defects, flags at most 15% of real photographs as blocking. A seat that misses the target has its rubric rewritten or is dropped |
| **Threshold setting** | The owner looks at about 20 surface samples at varying distance from target and marks which still "read as" the colour. The † thresholds are set from those answers and recorded |
| **Swatch rendering spike** | One rendered panel for Wada #231: every chip within ΔE00 1.0 in the PNG, and the owner finds it at least as attractive as the reference's generated cards. If the owner prefers the generated look, the texture approach is reworked until exactness and appeal are both met |

Checkpoint: a results note, updated cost table, updated capability ledger, and a go / change-course recommendation.

## Stage 1 — First Plate (the vertical slice)

One palette, end to end, from the command line: Wada #231, so the result can be set directly beside the reference.

Scope: brief → concept → room plan → plan review → four candidates → measured triage → blind panel → adjudication → **one** revision round → drawn swatch panel → diptych → verification → a static proof page.

| Acceptance test | Measure |
|---|---|
| The hearth problem cannot recur | The plan review blocks a plan with seating across a hearth or door (tested with a deliberately bad plan) |
| Exact swatches | All chips within ΔE00 1.0 in the export; within the Stage 0 limit after a JPEG round trip |
| The room reads as the palette | All surface, cast, order and proportion gates pass on the champion; the cold viewer names all three colours |
| Format is right first time | Room is exactly 9:16; diptych exactly 1080 × 1350 |
| Legible on a phone | Swatch names meet the size and contrast gates in a real 390 px screenshot. If not, the carousel fallback is adopted and recorded |
| Provenance is complete | From the proof page, every image can be traced to its prompt, model, parameters, parent and cost |
| Resumable | Killing the run at any stage and resuming spends nothing twice |
| Honest proof | Every statement tagged measured, observed or inferred; skipped checks listed |
| **Better than the reference** | Shown the new room and the reference room unlabelled, the owner prefers the new one |
| **Better than the simple loop** | The same brief run through architecture A (prompt, critique, re-prompt) for the same spend; the owner prefers B's result unlabelled |
| Cost | Actual cost of the run reported and within the per-Plate cap |

Checkpoint: the Plate, its proof, the A-versus-B comparison, measured cost.

## Stage 2 — Autonomy

The full loop, unattended, across varied briefs.

Scope: up to three rounds, all revision tools, champion-versus-challenger, cross-family confirmation, caps, escalation, provider fallback, A/B on taste.

Test run: 12 briefs across palette sizes and room types, no human input between brief and proof.

| Acceptance test | Target |
|---|---|
| Runs that finish with a proof or a proper escalation | 12 of 12; none hang, loop or overspend |
| Proofs at High or Medium confidence | at least 9 of 12 |
| Owner approves without asking for changes | at least 7 of 12 |
| No approved-quality regressions | In every run, the final champion beats the round-1 champion or is the same image |
| Invented defects | No revision was triggered by a finding the confirmer rejected |
| Failure drills pass | Simulated provider outage, refusal, malformed reviewer output, and all-candidates-fail each end in the documented response |
| Confidence means something | Owner approval rate is higher for High than for Low proofs |
| Cost per approved Plate | Measured and reported; at or under the cap |

Checkpoint: the twelve proofs as a contact sheet, a table of the measures above, and the list of most common rejection causes. If geometry is the leading cause, the 3D-first experiment (WORKFLOW §1, C) is proposed here.

## Stage 3 — The studio

The interface, built around the proof.

Scope: brief form; live status; proof page; version tree with any-two compare; palette library; approve / revise / reject; reopen and branch any version; exports; sign-in; records in a database and object store; runs moved to a durable workflow on the host.

| Acceptance test | Measure |
|---|---|
| Brief to started run | Under one minute, on a phone |
| The image is the hero | On every screen with a Plate, the image takes at least 60% of the first view; no control overlays it |
| Reversible | Any earlier version can be restored or branched; nothing is ever deleted (verified by test) |
| Compare | Any two versions side by side and as a slider, with their measurements |
| Survives a refresh or a closed laptop | A run continues and its status is correct on return |
| Secrets | No provider key in the browser bundle or network traffic (automated check) |
| Browser flows | Scripted flows pass at desktop and phone widths |

## Stage 4 — Series and house style

Scope: overnight batches; a house style built from approved Plates; contact-sheet review; consistency checks across a series; rubric updates from rejection reasons.

| Acceptance test | Target |
|---|---|
| Overnight series of 8 | All finish; a morning review takes under 10 minutes |
| A series looks like one hand | The owner, shown a grid of 9, judges it coherent; no two rooms share a layout |
| Learning | First-pass approval rate over the latest 20 Plates is higher than over the first 20 |

## Measures tracked from Stage 1 onward

First-pass approval rate · cost per approved Plate · rounds per Plate · share of runs escalated · each seat's calibration scores · most common rejection causes · share of proofs at each confidence band.

## Not planned

Automatic posting, video, physical paint matching, public accounts. Any of these is a new owner decision.

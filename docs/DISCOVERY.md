# Discovery — what exists, what is missing, what cannot be verified

_2026-11-15. Evidence for the decisions in VISION, WORKFLOW and ARCHITECTURE. Nothing here is implementation._

## 1. This repository

The `architectural-color-studio` branch holds `AGENTS.md`, the brief, and a pointer folder for the Calendar Home Hub. There is no studio code, data, or asset. Everything is to be designed.

## 2. The reference site

Inspected 2026-11-15 by loading the public page in headless Chromium at 1440 px and 390 px, clicking through its three tabs, and downloading its two images. Its source was not available and was not needed.

### What it is

A private **review notebook**, not a production studio. It holds the 348 Sanzo Wada colour combinations, one room study ("The Cameo Salon", Wada #231, V1) and one swatch sampler image. A person taps the image to sample colours, reads hand-written review cards, sets a status, and exports a review sheet. Its own review guide states the loop: *"export a revision brief → create the next version in ChatGPT → upload and compare. The site measures pixels; the design judgment is a human/ChatGPT review."* and *"Uploading does not automatically run an AI review."*

### Proven (observed working)

| Capability | Evidence |
|---|---|
| Wada palette library, 348 combinations with names and hex values | Palettes tab |
| Point sampling against palette targets (9 × 9 px average, CIE76) | Colour check panel, three readings |
| Honest framing of measurement limits | "review cues, not pass/fail standards… do not certify paint, print or display accuracy" |
| A written review standard in six parts | Review guide tab |
| Severity-ranked findings with a Keep item | Five cards on the room study |
| Status, notes, review-sheet and data export | Controls present; export not exercised |
| Usable phone layout | 390 px screenshot |
| A calm, book-like interface that keeps the image central | Both screenshots |

### Missing

- **No generation.** Images are made elsewhere by hand and uploaded.
- **No automated review.** The five findings on the room study were written by a person or pasted from a chat.
- **No revision loop.** Only V1 exists. There is no before/after view to judge, and no lineage.
- **No prompt provenance.** Nothing records how either image was made.
- **No finished deliverable.** The room and the swatches are separate images. The side-by-side piece the brief asks for does not exist.
- **Measurement is manual and narrow.** Three hand-placed points per image, one colour-difference formula, no handling of lighting.

### Cannot be verified

- Which model produced the two images, and with what prompts.
- How data is stored or who can read it. The page's data endpoint returns an empty list to an anonymous visitor.
- Whether the hex values match Wada's printed plates. The site says "source verified"; the commonly used digital set is an MIT-licensed transcription whose values are modern approximations of the inks ([dataset](https://github.com/mattdesl/dictionary-of-colour-combinations)). Not checked against the book.
- Whether review-sheet export, compare, or cross-device saving work as described.

## 3. What the two reference images teach

Measured with `research/measure_reference.py`: median of hand-placed rectangles on flat, evenly lit areas, pixels assumed sRGB (neither PNG carries a colour profile). ΔE00 is CIEDE2000. These readings agree with the site's own three samples.

### The room (1051 × 1496)

| Surface | Target | Measured | ΔE00 | What moved |
|---|---|---|---|---|
| Wall panel, centre | Cameo Pink `#E0B3B6` | `#C69A8D` | 10.0 | Hue +26° toward orange, 10 L darker |
| Wall panel, left | Cameo Pink | `#B4877A` | 14.8 | Same hue shift, 17 L darker |
| Ceiling | Cameo Pink | `#C89E92` | 9.0 | Same hue shift |
| Chair leather, right | Hay's Russet `#793327` | `#6F3423` | 3.1 | Close |
| Chair leather, left | Hay's Russet | `#5E2F20` | 6.5 | Darker, less chroma |
| Sofa | Olympic Blue `#5A82B3` | `#465361` | 20.1 | Chroma −20, 19 L darker: a slate grey |

Findings that shape the design:

1. **The drift is lighting, and it is systematic.** Every pink surface is rotated about 26° toward orange. That is an amber wash over the whole scene, not three separate colour mistakes. The fix belongs in the lighting direction, before generation, not in three colour corrections after it.
2. **The same material reads differently across the room** (left and right chairs differ by ΔE00 ≈ 4; left and centre wall by ≈ 5). A single point sample cannot represent a surface. Measurement needs regions and a stated statistic.
3. **Seeing and measuring disagree, and both matter.** Looking at the image, the vision model auditing it read the sofa as a clear mid blue. The pixels are a desaturated slate. Against a warm pink surround a slate does read bluer (simultaneous contrast), which is precisely the phenomenon Wada's combinations are about. The system therefore needs two separate instruments: measurement of pixels, and a test of what a viewer names. Neither may stand in for the other.
4. **The room is believable as a rendering, not as a home.** Perfect bilateral symmetry, a very large salon with a ~4 m ceiling, paired identical chairs, one of every prop, a sofa placed across the hearth, a glowing cove with no visible source, nothing that suggests anyone lives there. The reference's own review caught the hearth and the cove. The brief asks for "approachable"; this is a hotel lobby.
5. **The format is wrong and was found late.** The image is 0.703 wide-to-tall, not 9:16 (0.5625); a centred crop would cut the chairs. Format must be fixed before generation, not checked after.

### The swatch sampler (1536 × 1024)

| Card | Target | Measured | ΔE00 |
|---|---|---|---|
| Hay's Russet | `#793327` | `#763528` | 1.0 |
| Cameo Pink | `#E0B3B6` | `#D9AAA8` | 3.1 |
| Olympic Blue | `#5A82B3` | `#557AA2` | 3.6 |
| Ivory Buff | `#EBD3A2` | `#DDC09A` | 5.9 |
| Green Blue | `#099197` | `#096267` | 16.9 |

The cards are attractive: tactile, embossed, well lit. But a generated swatch is a picture of a swatch. One is within tolerance, three are visibly off, one is a different colour. Gold lettering is hard to read on the pale cards. A swatch that is "precise, attractive, and useful" cannot come from an image model. It has to be drawn from the numbers. See VISION §4.

## 4. Image generation providers — honest status

**Nothing has been tested by this project.** No provider key is connected. The table below is desk research from November 2026, mostly third-party pages that disagree with each other. Treat every price as an estimate until a real invoice replaces it.

| Family | Reported strengths for this work | Reported cost | Notes |
|---|---|---|---|
| OpenAI GPT Image 2.x | Polished commercial photography, strong instruction following, image editing with references | Token-billed; third-party measurements of about $0.03–0.11 per image or edit ([1](https://dev.to/lygerone/gpt-image-26-pricing-what-one-edit-really-costs-on-fal-measured-5aan), [2](https://www.mockingbirdhouse.com/guides/gpt-image-2-6-pricing)) | Likely what made the reference images. No batch discount reported for the newest version. |
| Google Gemini image ("Nano Banana" 2.x, Pro) | One interiors test ranked it first; strong environmental realism; multi-image references; up to 4K | About $0.03–0.07 at 1K, Pro about $0.13 at 2K and $0.24 at 4K; batch about half ([1](https://benchlm.ai/media-pricing/nano-banana), [2](https://www.meltflexai.com/blog/which-ai-is-best-for-interior-design)) | Model line is changing quickly; verify names and status. |
| Black Forest Labs FLUX.2 / 3 | Photographic realism; vendor claims hex-code colour control; multi-reference editing | About $0.03–0.07 per megapixel ([1](https://fal.ai/flux-2), [2](https://docs.bfl.ai/flux_2/flux2_overview)) | Hex claim is the vendor's own; no independent test found. |

What the research does establish:

- **No model reliably hits an exact colour from a prompt.** Text encoders split hex codes into meaningless fragments; an independent benchmark measuring returned pixels found no model passing cleanly ([GenColorBench](https://arxiv.org/pdf/2510.20586), [IMG.LY](https://img.ly/ai-benchmarks/findings/brand-color/)). Plan for measurement and correction.
- **Which model is best for interiors is not settled** and the available comparisons are vendor-adjacent. A small paid bake-off on our own briefs (ROADMAP Stage 0) is the only trustworthy answer, and costs a few dollars.
- **Model judges rank more reliably than they score.** Pairwise comparison is more self-consistent than absolute ratings for images, with position-swap checks to control order bias ([GenArena](https://arxiv.org/pdf/2602.06013)). Model and human aesthetic judgment can look aligned without being so ([AAAI-26](https://ojs.aaai.org/index.php/AAAI/article/view/39666/43627)). WORKFLOW is built on this.

## 5. Consequences

1. The reference's best ideas are kept: the Wada library, honest measurement language, severity-ranked findings, the quiet interface.
2. Its manual loop is replaced by a pipeline that generates, measures, reviews and revises on its own.
3. Its two failures drive the two biggest design decisions: **swatches are drawn, not generated**, and **light is specified before colour is judged**.

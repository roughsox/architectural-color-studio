# Architectural Color Studio — Reimagined

## Mission
Build an exceptionally polished, practical creative production studio for luxury architectural color-palette social imagery. Primary output: a visually coherent room image and an elegant matching color-swatch panel, side by side. The result must be believable, aspirational, approachable, and compelling at social-media scale.

Reference product: https://architectural-color-studio.couger0852.chatgpt.site/ . Treat as inspiration and a source of problems to solve, not a UI or architecture specification. Do not assume access to its private source.

## First task for Claude: discovery and reimagination
1. Inspect this repository and the reference site. Identify what is proven, what is missing, and what cannot be verified.
2. Write a concise product vision, user journey, system architecture, and staged implementation plan BEFORE extensive coding.
3. Propose at least two workflow architectures, evaluate reliability, autonomy, costs, and quality control, then select one with explicit rationale.
4. Establish visual quality criteria with concrete examples, not merely aesthetic adjectives. Prioritize the quality of the final creative artifact over dashboard complexity.

## Proposed creative workflow
- **Brief:** palette, mood, room type, intended audience, social format, reference images, functional constraints.
- **Art direction:** translate palette into a credible architectural concept with intentional material, lighting, furniture, composition, and practical livability.
- **Generation:** produce candidate imagery, preserving a reproducible revision trail and prompt provenance.
- **Independent reviews:** architect (proportions, circulation, buildability), builder (constructability, details), interior designer (space, furnishings, hierarchy), stylist (believability and restraint), color specialist (palette fidelity, illumination, perceptual differences), and visual/composition editor (social presentation, crop, typographic hierarchy).
- **Synthesis:** one adjudicator reconciles conflicting reviews, ranks issues by severity, and generates a targeted revision brief. Reviewers should not simply rubber-stamp each other.
- **Verification:** render actual outputs, capture screenshots, measure sampled colors against target swatches, check mobile layout and crop, flag geometry/artifact errors, and compare before/after. Never claim pixel accuracy from unverified visual intuition; account for illumination and color-management limitations.
- **Approval/export:** polished side-by-side swatch + room composition, standalone assets, and an audit/revision record.

## Nonnegotiables
- The creative image is the hero; the interface should be elegant and unobtrusive.
- Avoid sterile or conspicuously AI-generated rooms: repetitive decor, implausible geometry, floating furniture, uniform plants, incoherent shadows, blocked circulation.
- Swatches should be precise, attractive, and useful for envisioning the palette in a real home.
- Preserve original assets, approved versions, and decisions; allow reversible iterations and compare views.
- Keep human intervention minimal but make final decisions understandable, with confidence and evidence.
- Distinguish automated visual critique from actual measurements; don't pretend to have browser/screenshot/model capabilities that are not integrated.
- Treat architectural/building-code claims as advisory unless verified for a jurisdiction.
- Make workflows resilient to failed generations, inconsistent reviewers, and revision loops; cap iterations and escalate irreconcilable conflicts.
- Provide honest evaluation of image-generation provider capabilities and operating cost before implementation.
- Ensure secrets stay server-side; avoid committing credentials.

## Initial deliverables
1. `docs/VISION.md`: ambitious but concrete experience and quality bar.
2. `docs/WORKFLOW.md`: agent roles, orchestration, critique rubric, escalation, approval, revision loop.
3. `docs/ARCHITECTURE.md`: proposed stack, data model, provider interfaces, screenshot/visual evaluation strategy, security and cost.
4. `docs/ROADMAP.md`: staged build with measurable acceptance tests.
5. A high-quality first working vertical slice after the design direction is established.

## Collaboration
Claude is the primary builder. ChatGPT can act as an independent reviewer. Store concise checkpoints and unresolved decisions in the repository so either assistant can resume without losing context. Do not merge into main without approval.

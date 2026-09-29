---
name: figma-screenshot-to-code
description: >
  Converts a Figma screenshot (PNG/JPG export, no Figma API or Dev Mode access)
  into a production-ready React, Next.js, or HTML/Tailwind component. Use when
  the user pastes or uploads a design screenshot/mockup and asks for it to be
  built as code, when no Figma MCP/API/token is available, or when the request
  mentions "pixel perfect", "match this screenshot", or "convert this design".
---

# Figma Screenshot → Code

## When to use

Trigger when the user provides one or more images of a Figma frame (screenshot,
exported PNG, or pasted clipboard image) and wants working code. Do NOT assume
Figma API/MCP access — treat the image as the only source of truth.

## Inputs to ask for (only if missing)

- Target stack: React, Next.js (App Router?), or plain HTML/CSS. Default to
  whatever the project's existing stack is if code already exists in the repo.
- Styling approach: Tailwind (default), CSS Modules, styled-components — check
  the existing codebase first before asking.
- Whether this is a new component or should match/extend existing components
  (check for a design system / shared component library already in the repo).
- Multiple screenshots for different states (hover, error, empty) or
  breakpoints (mobile/desktop) — ask if only one was given but the layout
  looks state-dependent (e.g. a form, a toggle, a card with a badge).

## Phase 1 — Inspect (before writing any code)

Look at the image carefully and build a written inventory before generating
anything. This step is what separates accurate output from a rough guess:

1. **Layout structure**: identify the outer container, then nested sections.
   Note whether groups are laid out as rows (flex-row) or columns (flex-col),
   and flag ambiguous side-by-side sections explicitly — these are the most
   common failure point for vision-based conversion.
2. **Repetition**: count exact number of repeated items (list rows, cards,
   nav links, table rows). Do not paraphrase with placeholders/comments like
   "...repeat for each item" — every visible instance must be rendered in the
   generated code, or genuinely mapped over real data if the count is
   variable/obvious (e.g. a table).
3. **Typography**: for each distinct text style, estimate font-size (px),
   weight, line-height, and letter-spacing relative to other text in the same
   image (use ratios, not guesses in isolation — e.g. "this heading is ~1.75x
   the body text size").
4. **Color sampling**: list every distinct color used (backgrounds, text,
   borders, icons) as best-guess hex values. Group near-identical shades
   rather than inventing many one-off values — real UIs usually reuse a small
   palette.
5. **Spacing**: estimate padding/margin/gaps in multiples of 4 or 8px
   (standard spacing scales). Don't invent odd values like 13px unless the
   image clearly shows something irregular.
6. **Assets**: flag icons, images, and logos that need placeholders (note if
   they look like a known icon set — Lucide, Heroicons, Material — so the
   right package can be used instead of hand-drawn SVG).
7. **Interactive affordances**: note anything implying state — buttons,
   inputs, dropdowns, toggles — even if only one static state is shown.

## Phase 2 — Plan

Turn the inventory into a short component plan before coding:

- Component/file breakdown (don't put everything in one file if the design
  has clearly reusable pieces — e.g. a Card, a Badge, a NavItem).
- Props each component needs, if data-driven (list items, table rows).
- Confirm styling tokens (colors, spacing, font sizes) as a small token table
  or Tailwind config additions, rather than sprinkling raw hex/px values
  through every component — this makes the self-review pass in Phase 4 easier
  and matches how a real design system would be organized.
- If matching an existing codebase, check its existing components/tokens
  first and reuse them instead of re-declaring new ones.

## Phase 3 — Generate

- Write semantic markup; avoid div-soup where a real element fits
  (button, nav, header, ul/li for lists, table for tabular data).
- Match the framework's conventions (Next.js: 'use client' only where needed,
  correct file/folder structure for the App Router; React: functional
  components with typed props if the project uses TypeScript).
- Use the exact repeated-item count identified in Phase 1 — never truncate a
  list to "2 items + a comment" for brevity.
- Prefer the project's existing UI primitives (e.g. shadcn/ui, existing
  Button/Card components) over hand-rolling new ones, if present.
- For side-by-side layouts, default to flexbox with explicit
  justify/align — this is the most common place vision-based generation
  drifts from the source image.

## Phase 4 — Self-review against the screenshot

Before handing back the result, re-compare the generated component
(mentally, or by rendering if a preview tool is available) against the
original image on:

- [ ] Every repeated element present, correct count
- [ ] Layout direction/alignment matches (esp. side-by-side sections)
- [ ] Color palette matches (no invented colors not in the image)
- [ ] Font-size hierarchy matches relative proportions
- [ ] Spacing looks proportionally correct, not just "close enough"
- [ ] No placeholder comments left in place of real content/markup

Call out explicitly to the user anything you couldn't determine confidently
from the screenshot alone (e.g. exact hex codes, font family name, exact px
spacing) rather than silently guessing — offer to adjust once they confirm
or provide a design-token reference.

## Common failure modes to actively guard against

(from real-world evals of vision-based screenshot-to-code conversion)

- Being "lazy" on long/repeated lists — always render the full set shown.
- Collapsing side-by-side flex sections into stacked/vertical layouts.
- Inventing exact pixel/hex values instead of stating them as estimates.
- Skipping small but visible details (badges, icon buttons, dividers) because
  they're easy to miss in a single glance.

## Output

Deliver working code files (not just a code block) in the appropriate
project structure, plus a short note listing any assumptions made (exact
colors, fonts, spacing) so the user can correct anything from the real
Figma file when convenient.

# How-It-Works Visual Feature Detail Pages — Design

**Date:** 2026-09-04
**Status:** Approved for planning
**Surface:** `packages/web` (Vite + React + react-router-dom)

## Goal

Make each Masqo feature on `/how-it-works` easier to understand through
visual media — flow diagrams and (later) video demos — while remaining
fully usable by screen-reader / blind users. Serve **both** audiences:
sighted non-technical users get diagrams and video; screen-reader users
get equivalent text (redundant step lists, `role="img"` titles/descs,
captions slot, transcripts).

## Scope

Add four feature detail pages, each with an accessible flow diagram and
a video-with-fallback block. Convert `/how-it-works` into an overview
that links out to each detail page. No changes to the detection engine,
CLI, or extension behavior.

### New routes

| Route | Feature |
|-------|---------|
| `/how-it-works/web-app` | The paste→scan→review→clean editor on the home page |
| `/how-it-works/extension` | Browser extension paste interception on AI chat sites |
| `/how-it-works/cli` | Claude Code hook + CLI file-write redaction |
| `/how-it-works/engine` | Embedding `@masqo/engine` in your own code |

`/how-it-works` remains and gains a "See how it works →" link on each
of its existing feature sections, pointing to the matching detail page.

## Components (new, `packages/web/src/components/`)

### `FlowDiagram.tsx`

Inline SVG horizontal step-flow (e.g. Paste → Scan → Review → Clean).

- Accepts `steps: { label: string; caption: string }[]` and a
  `title` / `desc`.
- SVG carries `role="img"`, an `<title>` (short) and `<desc>` (full
  sentence) referenced via `aria-labelledby`/`aria-describedby`.
- **Redundancy rule:** the same steps also render as a visible ordered
  text list beneath the SVG, so meaning never lives in the graphic
  alone. The text list is what screen readers announce in order; the
  SVG is decorative-plus.
- Responsive: on ≤600px the flow stacks vertically (CSS class, no JS).

### `FeatureMedia.tsx`

Video-with-graceful-fallback block.

- Props: `src` (base path, e.g. `/media/web-app`), `poster`,
  `captionsSrc?`, `transcript` (React node).
- Renders `<video controls preload="none" poster={poster}>` with two
  `<source>` children: `${src}.webm` then `${src}.mp4`.
- Includes a `<track kind="captions" srcLang="en" label="English">`
  slot when `captionsSrc` is provided.
- **No autoplay**, `preload="none"` — respects local-first / low-noise
  brand and data use.
- When no media file exists yet the browser shows the `poster`
  (we point `poster` at a static diagram/placeholder image), so the
  page is never broken.
- Below the video: a `<details>` element containing the `transcript`
  text, always present regardless of whether video loads.

### `DetailPage.tsx`

Layout wrapper shared by all four pages (uses existing `Layout`).

- Renders: back-link to `/how-it-works`, `<h1>` title, lead paragraph,
  `FeatureMedia`, `FlowDiagram`, a per-feature body (steps / code),
  and a per-feature CTA (e.g. extension → Chrome Web Store, cli → npm).
- Props are content-only; no feature logic.

## Pages (new, `packages/web/src/pages/how-it-works/`)

Each imports `DetailPage` and supplies content. Content is drawn from
existing repo docs and the current `HowItWorks.tsx`, so it stays
accurate:

- **`WebApp.tsx`** — steps: Paste/load → Scan instantly → Review &
  accept → Copy/export. Mode + policy note. CTA: "Open the editor" → `/`.
- **`Extension.tsx`** — flow: Paste on AI site → Masqo intercepts →
  Review panel → Paste clean. Note: same engine, local, scans only at
  paste. CTA: Chrome Web Store link (reuse existing URL).
- **`Cli.tsx`** — flow: Claude Code writes file → `PreToolUse` hook →
  `masqo redact` → Claude sees clean output. Install + command code
  blocks (from `docs/claude-code-hook-setup.md`). CTA: npm `@masqo/cli`.
- **`Engine.tsx`** — flow: `createEngine()` → `scan(text, opts)` →
  detections + redacted output. Code sample. CTA: npm `@masqo/engine`.

## Media assets

- New dir `packages/web/public/media/` for future recordings
  (`web-app.webm/.mp4`, `extension.*`, `cli.*`, `engine.*`) and poster
  images. Not committed with real video this round.
- Posters: reuse the flow diagram concept as a static placeholder, or a
  simple branded still. A committed lightweight poster (SVG/PNG) ensures
  `FeatureMedia` always renders something before video exists.

## Accessibility requirements (acceptance)

- Every diagram: `role="img"` + `<title>`/`<desc>` **and** a redundant
  visible ordered text list.
- Every video block: captions `<track>` slot + always-present
  `<details>` transcript; no autoplay; `preload="none"`.
- Semantic heading order (single `<h1>` per page, `<h2>` sections).
- All links/controls keyboard reachable with visible focus.
- Color is never the sole signal (labels accompany colored steps).

## Routing / wiring

- `main.tsx`: add the four `<Route>` entries.
- `HowItWorks.tsx`: add "See how it works →" links on the four feature
  sections.

## CSS

- Add responsive rules in `index.css` for the diagram (stack on mobile)
  and video (max-width 100%, aspect ratio) — mirroring existing
  `@media (max-width: 600px)` patterns. Reuse 16px input rule already
  present; no viewport changes.

## Out of scope

- Recording actual videos (user supplies later).
- Any change to engine/CLI/extension logic.
- External/YouTube embeds (rejected: conflicts with local-first brand).

## Testing

- `npm run type-check --workspace=@masqo/web` clean.
- `npm run build --workspace=@masqo/web` succeeds.
- Existing `packages/web/src/web.test.ts` stays green.
- Manual: each detail page renders diagram + poster fallback + transcript
  with no committed video; nav links resolve both directions.

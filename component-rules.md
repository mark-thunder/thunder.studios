# Component rules

Five rules for every section and component on every site. Items 1–3 restate [LUMOS.md](LUMOS.md); where the two differ, LUMOS.md wins. Items 4–5 and the T Ricks search method are stated only here, so a Lumos upgrade never overwrites them.

## 1. Each section is a component

Every page section is a `Section` at minimum, holding `ContentWrapper` with `Eyebrow`, `Heading`, `Paragraph` and `ButtonWrapper` inside. A section that needs its own CSS, script or frontmatter becomes a named component:

- `src/components/content/` by default (`CtaMain`)
- `src/components/section/` only when its styles or script act on the section itself

A new component earns its existence; it never duplicates one that already covers the case.

Why, per T Ricks:

- **Fewer components, more variants.** Same content, different style: a variant. Different content: a new component. Switching a variant keeps the content in place; switching components means re-entering it.
- **One layout, many variants.** A `ContentWrapper` variant beats a custom section per design; clients use a layout in ways no one predicted.
- **Open first, closed where needed.** Build from open layouts. Close a component (`CtaMain`) only when its copy must match on every page. Built on the same layout, a style change reaches both.
- **The parent variant styles its children.** A layout variant sets its heading, text and button styles through inherited variables, as `--_alignment` does; an instance can still override them.

## 2. Scripts live in their component, never the page

A component's `<script>` and `<style is:global>` (under `@layer components`) stay in its own file. Copied into another page, it works with nothing else moved. Tokens and utilities in `src/styles` are the only global exception. A site-wide script is its own `utility/` component, mounted once in `BaseLayout`.

## 3. Props are always set up

- `render`, default `true`. Outputs nothing when it is `false`, when a required prop is missing, or when `slotContent` finds the slots empty.
- Order in the type and the destructure: `render`, per-instance content, `variant`, variant-only props, occasional settings, then `class` and `...rest`.
- Variant-only props sit behind a discriminated union on `variant`.
- The style switch is named `variant`, never something narrower like `theme`, so it can carry any kind of change and reads the same on every component. A parent forwarding a child's variant may relabel it (`paddingTop`).
- Tooltips use the wording other components already use.
- Section props are forwarded with `ComponentProps<typeof Section>` and `Pick`.
- Text that differs per instance is a prop. Text that is the same everywhere stays in the component.

Check with the `lumos-audit-props` skill.

## 4. Accessible by default (WCAG 2.2 AA)

- Semantic tags, one `h1`, heading levels in order
- Every field labelled, with `autocomplete` tokens where they apply
- `aria-live` on status text that changes
- Hidden and disabled states set in markup, not only in CSS
- Everything reachable by keyboard, with a visible focus ring
- Real `alt` text, or `alt=""` on decorative images
- Text contrast of at least 4.5:1
- `prefers-reduced-motion` respected
- Content still shows without JavaScript
- Zoom never disabled; form fields at least `1rem`

Check with axe-core; 0 violations before work is done.

## 5. Motion: Lenis, ScrollTrigger, SplitText, image scale

Every Astro site ships the same four effects, and nothing else animates on scroll:

- **Lenis** is the one page scroller. It runs on GSAP's ticker, and every Lenis scroll calls `ScrollTrigger.update`.
- **ScrollTrigger** drives every scroll effect.
- **SplitText** reveals headings line by line, rising from masks.
- **Images scale down inside their parent** (1.2 → 1, scrubbed), and the parent crops them.

Before writing or changing any motion, load the GSAP skills that apply: `gsap-core` always; `gsap-scrolltrigger` for triggers and scrub; `gsap-plugins` for SplitText; `gsap-timeline` for sequences; `gsap-performance` before calling it done. Follow the skill over memory; where a skill and this rule differ, this rule wins and the reason is written here.

- **One place.** `src/utils/motion.ts` registers the plugins and sets the shared ease and duration. It starts Lenis (`startSmoothScroll`) and exports `withMotion`, `scrollToTarget`, `revealEach` and `revealStart` (the one reveal point every scroll reveal uses). `utility/SmoothScroll` is mounted once in `BaseLayout`. Each effect's script lives in the component that owns it (rule 2): `ContentWrapper` (heading and content reveal), `Img animate` (scale inside the parent), `Grid` (row reveal), `Marquee`, `Counter`, `HeroMain` (backdrop).
- **Reduced motion.** Every effect is set up inside `withMotion` (`gsap.matchMedia`). When someone asks for less motion, there is no Lenis, and nothing is hidden or moved.
- **Content without JS.** GSAP sets start states at runtime, never in markup or CSS. Fade with `opacity`, not `autoAlpha`, so the keyboard can still reach content that hasn't played.
- **2D only.** `gsap.config({ force3D: false })`, with no `will-change`. 3D layers shift dark backgrounds a shade on Mac displays (fix #41). The GSAP skills' own advice is to not force layers everywhere.
- **Scrolling goes through Lenis.** Script-led scrolls call `scrollToTarget`. Lenis keeps native scroll, so sticky, anchors and focus still work. Its `anchors` option handles same-page links, `allowNestedScroll` lets panels scroll, and dialogs are prevented from scrolling the page.
- **ScrollTrigger rules.** Don't use scrub and toggleActions on the same trigger. Put ScrollTrigger on the top-level tween or timeline, never on a child tween. `invalidateOnRefresh` goes on a ScrollTrigger, not on a plain tween. Refresh when page height changes; window resizes refresh on their own. No markers in production. Add `refreshPriority` if anything is ever pinned.
- **SplitText.** Use `autoSplit` with the animation returned from `onSplit`. Split only lines, masked. Set `aria: "none"`, because the default label joins lines across a `<br>` with no space. Line breaks must match the unsplit heading: compare heading heights with scripts off and on.
- **`render={false}` renders no slots.** Every component guards `slotContent` with `render`. Astro includes a component's script only once, the first time it renders, so rendering and then discarding a slot drops the script from the whole page.
- **Check** that no transform GSAP writes is 3D, that the reveals play at 1440, 768 and 375, and that axe finds 0 issues.

## 6. Record it in `progress.md`

A section, component, variant or token that lands updates `progress.md` in the
same commit, following "Keeping it current" at the top of that file.

## When the docs don't answer: ask T Ricks

For approach, responsiveness and design (component structure, variants, layouts, spacing, type, fluid sizing) not covered by `LUMOS.md`, `AGENTS.md` or this file, search the `t-ricks` MCP server (Cloudflare AI Search over 306 Timothy Ricks transcripts, 2019-10 to 2026-09). Folders run oldest to newest: `part-1/` to `part-3/` (2019 → 2025-05), `part-4/` and `part-5/` (2025-05 → 2026-09).

Not for infrastructure (Cloudflare, Sanity, deploys, APIs): use that product's current docs.

1. Search the recent folders first: `filters: { "folder": { "$in": ["part-4/", "part-5/"] } }`.
2. Search everything, no filter.
3. Merge. Where they disagree, the newer video wins; say what changed. Use an older passage only when the recent ones don't cover it, and give its year.
4. Answer with the quoted line, the video file (date and title) and one label: **Stated** (he says it), **Inferred** (follows from a quoted line) or **Not covered**.

Scores are relative: the top hit is always 1, even when nothing fits. Judge coverage by the quoted text, not the score.

Reranking stays off on the instance: it scores caption text near zero and drops every result.

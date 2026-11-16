# Fluffy Hugs — animation landing page

A single, animation-heavy landing page inspired by [fluffy-animation.vercel.app](https://fluffy-animation.vercel.app/).
Built with **Next.js (App Router, TypeScript)**, **SCSS Modules**, **GSAP + ScrollTrigger** and **Lenis**.
All artwork is original inline SVG, so there are no image assets to load.

## Setup

Requirements: Node 20+ and npm.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

## The 3 slides implemented

1. **Loading screen** — a breathing character, a progress bar and a counter. When everything is ready, a curved
   curtain lifts away. The preloader's reveal overlaps the hero entrance.
2. **Hero** — a staggered pop-in of floating characters, masked title lines, idle bobbing, layered pointer parallax,
   a squishy hop when you touch a character, and a blob CTA with hover states. The stage recedes as you scroll away.
3. **Collection** — masked heading reveal, a card grid with staggered reveals and per-column parallax, card hover
   (lift, shadow, character wiggle, arrow), and a pinned "Soft. Squishy. Yours." strip that scrubs with scroll.

The collection layout is my own design. The reference's hero and loader were the only parts I could inspect.

## Libraries and why

| Library | Why |
| --- | --- |
| **Next.js 16** | Required. The page is statically prerendered, and the Collection is a lazily loaded client chunk. |
| **SCSS Modules** (`sass`) | Component-scoped styles on top of a shared token / breakpoint / mixin layer (see below). |
| **GSAP + ScrollTrigger** | Timelines for the choreographed load sequence, `matchMedia` for per-breakpoint setups, and `scrub` / `pin` for scroll-driven motion. The reference also uses GSAP. |
| **Lenis** | Smooth wheel scrolling. It is driven by GSAP's ticker so there is a single rAF loop and ScrollTrigger always agrees on the scroll position. |

No other runtime dependencies.

## Approach

### Animation

- **One kind of transform per element.** GSAP animates `transform` and `opacity` only. Where several effects hit
  the same visual (e.g. hero characters), each effect owns its own DOM layer, so tweens never fight
  (`[data-layer]` parallax → `.slot` position → `[data-pop]` entrance/hover → `[data-float]` idle).
  For UI chrome, GSAP animates the wrapper and CSS `:hover` animates the child, so the inline transform from the
  entrance never freezes the hover.
- **Load:** `Preloader` eases progress toward 90% while real work happens (`document.fonts.ready`, the `load` event
  and a minimum display time), then completes, fades its content and lifts the curtain. It calls `onReveal`
  mid-curtain, which starts the hero entrance timeline.
- **Scroll:** ScrollTrigger one-shot reveals, scrubbed parallax (hero layers and grid columns move at different
  speeds), a scrubbed stage recede on the hero, and a pinned scrubbed timeline for the featured strip.
- **Hover:** CSS transitions with the reference's `cubic-bezier(0.2, 0.75, 0.25, 1)` curve. Hover styles are wrapped in
  a `hover` mixin (`(hover: hover) and (pointer: fine)`), so touch devices never get stuck hover states.
  Keyboard focus mirrors hover.
- **Cleanup:** every effect runs inside `gsap.context` / `gsap.matchMedia` (`src/hooks/useGsap.ts`), so React strict
  mode, HMR and resizes revert cleanly.

### Smooth scroll

`SmoothScroll` creates Lenis with `autoRaf: false`, feeds it from `gsap.ticker`, and forwards its scroll events to
`ScrollTrigger.update`. Programmatic scrolling (the CTA) goes through `lib/scroll.ts`, which uses Lenis when it
exists and falls back to native smooth scrolling. Lenis is **not** created on touch devices, low-power devices or
with reduced motion. Those get native scrolling.

### Responsive

- **Breakpoints:** mobile `< 48rem`, tablet `48–79.99rem`, desktop `≥ 80rem`. They live in
  `styles/abstracts/_breakpoints.scss` and are mirrored as `MQ` in `lib/motion.ts`, so CSS and GSAP agree.
- **Fluid sizing:** type, gutters and character sizes use `clamp()` (a `fluid()` SCSS helper), and the hero uses
  `svh`. Layout therefore changes continuously instead of in jumps.
- **Resize:** `gsap.matchMedia` re-runs the animation setup when a breakpoint (or input capability) flips. For example,
  the Collection's pin is only created on tablet and desktop, and the parallax column count changes from 3 to 2
  to none. ScrollTrigger refreshes itself on resize.
- **Characters by tier:** each hero character has a tier (1 = always, 2 = tablet+, 3 = desktop only). Hidden tiers are
  `display: none` and are skipped by the JS, so small screens do less work.

### CSS architecture

```
src/styles/
  abstracts/   _tokens (colors, easing, z-index, gutter)  _breakpoints (up/down/hover/low-power mixins)
               _functions (color(), fluid())               _mixins (focus-ring, display-heading, cover…)
  base/        _reset, _typography
  globals.scss CSS custom properties from the token map, scroll lock, reduced-motion safety net
src/components/<Name>/<name>.module.scss   component styles, each `@use "abstracts" as *;`
```

`sassOptions.loadPaths` in `next.config.ts` lets every module write `@use "abstracts" as *;`.

## Performance notes

- Only `transform` and `opacity` animate, and no tween ever touches layout properties. The hover shadow on cards is a
  pseudo-element faded with `opacity`, not an animated `box-shadow`.
- `will-change` is limited to the few elements that animate continuously. The hero uses `contain: layout paint`.
- A single rAF loop (GSAP ticker) drives Lenis, ScrollTrigger and all tweens. `lagSmoothing(0)` is set.
- Idle tweens are grouped in one timeline that is paused when the hero leaves the viewport. The pointer parallax is
  ignored when the hero is off-screen.
- Pointer parallax uses `gsap.quickTo`, so there is no per-move tween allocation.
- The Collection is a separate chunk (`next/dynamic`, `ssr: false`) mounted by an `IntersectionObserver` when it nears
  the viewport, so the initial load only pays for the preloader and hero.
- The artwork is inline SVG generated in code, so there are no image requests and nothing to lazy-load or decode.
  Fonts use `next/font` (self-hosted, `display: swap`).
- Measured locally (production build, scrolling the whole page programmatically): no frame longer than about 15 ms
  on a ~75 Hz display (p95 ≈ 15 ms, zero frames over 20 ms).

### Lower-powered devices and reduced motion

| Condition | Behavior |
| --- | --- |
| `prefers-reduced-motion` | The preloader just fades. The hero fades in with no movement. There is no Lenis, no idle motion, no parallax, no pin, no hover hop, and the cards fade in only. |
| Touch / coarse pointer | Native scrolling and no pointer parallax. Tapping a character still triggers the hop. |
| Low power (≤ 4 cores, ≤ 4 GB RAM, or Save-Data) | No Lenis, no pointer or scroll parallax, no idle rotation, and shorter stagger. Desktop-only characters are dropped (one tier fewer). `html[data-perf="low"]` is set for CSS. |

### Slow loading

The page behind the preloader is not revealed until fonts and the window `load` event complete, and scroll is locked
via `html.is-loading` until then. If assets are slow, the loader simply stays up at 90%. Without JavaScript, a
`<noscript>` rule hides the preloader and unlocks scroll.

## Assumptions

- The reference is for illustration only, so I used original SVG characters instead of its NFT artwork.
- The CTA and the social buttons have no destination. They have hover and focus states, and the CTA smooth-scrolls to
  the collection section.
- The reference's other slides were not inspected beyond the hero and loader. The collection section is a new design
  that follows the same motion language.
- "Low power" is detected heuristically from `hardwareConcurrency`, `deviceMemory` and `saveData`. These hints are not
  available in every browser, in which case the device is treated as capable.
- The page always starts at the top on load (`history.scrollRestoration = "manual"`), so the entrance is always seen.

# Fluffy Hugs

A single animated landing page, based on the [fluffy-animation](https://fluffy-animation.vercel.app/) reference.
Next.js (App Router, TypeScript), SCSS Modules, GSAP + ScrollTrigger and Lenis.

## Setup

Needs Node 20+.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run start
npm run lint
```

## Slides implemented

1. **Preloader**: a breathing character with a progress bar. When the page is ready, a curved curtain lifts away.
2. **Hero**: floating characters pop in, the title slides up from a mask, and the characters keep bobbing. They react to
   the mouse (parallax), hop when hovered or tapped, and the stage shrinks and fades as you scroll away.
3. **Collection**: heading reveal, a card grid with a staggered reveal and a different parallax speed per column, card
   hover effects, and a pinned "Soft. Squishy. Yours." strip that is driven by scroll.

I only had the hero and loader of the reference to look at, so the collection layout is my own.
The characters are SVG drawn in code, so there are no image files.

## Libraries

- **Next.js**: required. The page is prerendered, and the collection is loaded as a separate client chunk.
- **SCSS Modules**: styles are scoped per component and share tokens, breakpoints and mixins.
- **GSAP + ScrollTrigger**: timelines for the load sequence, `matchMedia` for breakpoints, `scrub` and `pin` for scroll.
- **Lenis**: smooth scrolling. It is driven by GSAP's ticker, so there is one animation loop and ScrollTrigger always
  reads the same scroll position.

## How it works

### Animation

- Only `transform` and `opacity` are animated.
- One element, one kind of transform. Each effect gets its own wrapper (parallax, position, entrance/hover, idle float),
  so tweens never overwrite each other. For buttons, GSAP animates the wrapper and CSS `:hover` animates the element inside.
- **Load**: the preloader waits for fonts, the window `load` event and a minimum time. It then lifts the curtain and calls
  `onReveal` halfway through, which starts the hero entrance.
- **Scroll**: ScrollTrigger one-shot reveals, scrubbed parallax and a pinned, scrubbed timeline.
- **Hover**: CSS transitions with the reference's easing curve. Hover styles only apply on devices that can hover,
  and keyboard focus gets the same styles.
- All GSAP code runs inside `gsap.context` / `gsap.matchMedia` (`src/hooks/useGsap.ts`), so unmounting and resizing clean up.

### Smooth scroll

`SmoothScroll` creates Lenis and updates it from `gsap.ticker`. It is skipped on touch devices, low-power devices and
with reduced motion, where the browser scrolls natively. Code that scrolls programmatically goes through
`src/lib/scroll.ts`, which falls back to native smooth scrolling when Lenis is not running.

### Responsive

- Breakpoints: mobile `< 48rem`, tablet `48rem - 79.99rem`, desktop `>= 80rem`. They are defined once in SCSS and once
  in `src/lib/motion.ts`.
- Sizes use `clamp()` (see the `fluid()` helper), so the layout scales continuously between breakpoints.
- `gsap.matchMedia` rebuilds the animations when a breakpoint changes. For example the pinned strip only exists on
  tablet and desktop, and the number of parallax columns goes 3, 2, none.
- Hero characters have a tier. Tier 1 is always shown, tier 2 from tablet, tier 3 on desktop only.

### CSS structure

```
src/styles/
  abstracts/   tokens, breakpoints and hover mixins, helper functions
  base/        reset, typography
  globals.scss CSS variables for the colors, scroll lock
src/components/<Name>/<name>.module.scss
```

`sassOptions.loadPaths` in `next.config.ts` lets every module start with `@use "abstracts" as *;`.

## Performance

- No layout properties are animated. The card hover shadow is faded with `opacity`, not an animated `box-shadow`.
- `will-change` is only set on the few elements that animate all the time. The hero uses `contain: layout paint`.
- Idle animations live in one timeline that pauses when the hero is off screen. Pointer parallax uses `gsap.quickTo`.
- The collection is a separate chunk, mounted by an `IntersectionObserver` when it gets close to the viewport.
- Artwork is inline SVG and fonts come from `next/font`, so there is almost nothing to download.
- Local check on a production build, scrolling the whole page by script: no frame longer than about 15 ms.

### Reduced motion and weaker devices

- `prefers-reduced-motion`: the preloader fades out, the hero fades in without movement, and there is no smooth scroll,
  idle motion, parallax, pinning or hover hop. Cards only fade in.
- Touch devices: native scrolling and no pointer parallax. Tapping a character still makes it hop.
- Low power (4 cores or fewer, 4 GB memory or less, or Save-Data): no smooth scroll, no parallax, no idle rotation,
  a shorter stagger, and one fewer character tier.

### Slow loading

The hero stays hidden behind the preloader until fonts and the window `load` event are done, and scrolling is locked
until then. On a slow connection the loader just stays at 90%. Without JavaScript, a `<noscript>` rule hides the preloader.

## Assumptions

- The reference is for illustration, so I drew my own characters.
- The call to action and social buttons go nowhere. They have hover and focus states, and the call to action scrolls to
  the collection.
- "Low power" is a guess from `hardwareConcurrency`, `deviceMemory` and `saveData`. If a browser does not expose them,
  the device is treated as capable.
- The page always opens at the top (`history.scrollRestoration = "manual"`) so the entrance is always seen.

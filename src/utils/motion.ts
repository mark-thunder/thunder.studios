import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** The one ease and pace every effect shares, so the site moves as one. */
gsap.defaults({ ease: "power3.out", duration: 0.8 });

/* Plain 2D transforms. GSAP's default translate3d lifts each moving element
   onto its own GPU layer, and on Mac displays the dark background around
   that layer renders a shade off, so a band flickered in behind the marquee
   and scaling images until the tween ended. */
gsap.config({ force3D: false });

const MOTION = "(prefers-reduced-motion: no-preference)";

/**
 * Where every scroll reveal plays: once the element's top is this far down
 * the screen. One value, so headings, grids and counts enter together and
 * nothing sits blank in view while Lenis eases the scroll in.
 */
const REVEAL_AT = 0.85;

/**
 * The scroll position where `element` reveals: at `REVEAL_AT`, or just
 * before the page ends when it never gets that high, so nothing at the
 * bottom stays hidden. Pass it as a ScrollTrigger `start`.
 */
export const revealStart = (element: Element) =>
  Math.min(
    element.getBoundingClientRect().top + scrollY - innerHeight * REVEAL_AT,
    ScrollTrigger.maxScroll(window) - 1,
  );

/**
 * Runs `setup` only for people who have not asked for less motion, and undoes
 * everything it made (tweens, ScrollTriggers, splits) if they ask later.
 * Without it, nothing is hidden or moved: the page stays as the HTML drew it.
 */
export const withMotion = (setup: () => void | (() => void)) =>
  gsap.matchMedia().add(MOTION, setup);

let lenis: Lenis | undefined;

/**
 * Starts Lenis as the page's one scroller, on GSAP's clock so ScrollTrigger
 * reads every frame it moves. Called once, by `utility/SmoothScroll`.
 */
export const startSmoothScroll = () =>
  withMotion(() => {
    lenis = new Lenis({
      /* Same-page links, including /#work from the home page, glide to
         their target and stop short by its scroll margin. */
      anchors: true,
      /* Lists and panels that scroll on their own keep native scrolling. */
      allowNestedScroll: true,
      /* An open dialog keeps the page still: its backdrop scrolls nothing. */
      prevent: (node) => node instanceof HTMLDialogElement,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    /* An accordion or a late image changes the page height; triggers below
       it are measured again once it settles. */
    const refresh = gsap
      .delayedCall(0.2, () => ScrollTrigger.refresh())
      .pause();
    /* ScrollTrigger already refreshes on window resize, so only a change in
       page height at the same width counts here. */
    let { width, height } = document.body.getBoundingClientRect();
    const resized = new ResizeObserver(([entry]) => {
      const size = entry.contentRect;
      if (size.width === width && size.height !== height) refresh.restart(true);
      ({ width, height } = size);
    });
    resized.observe(document.body);

    return () => {
      resized.disconnect();
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = undefined;
    };
  });

/**
 * Brings `target` into view through Lenis, so a script-led scroll moves like
 * the rest of the page. Falls back to the browser where Lenis is off.
 */
export const scrollToTarget = (target: HTMLElement) => {
  if (lenis) lenis.scrollTo(target);
  else target.scrollIntoView({ block: "nearest" });
};

/**
 * Fades each item up as it scrolls in, a row at a time, once. Items already
 * on screen at load play straight away.
 */
export const revealEach = (items: Element[]) => {
  if (!items.length) return;
  gsap.set(items, { opacity: 0, y: "1.5em" });
  ScrollTrigger.batch(items, {
    start: (self) => revealStart(self.trigger!),
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, overwrite: true }),
  });
};

export { gsap, ScrollTrigger, SplitText };

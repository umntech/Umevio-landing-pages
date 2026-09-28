'use client';

import { useState, useEffect, useRef, useCallback, memo, type CSSProperties, type ReactNode } from 'react';
import { client } from '@/lib/client.config';

/**
 * AiVideoLanding — the /ai-video page, built on the REAL umevio.com design
 * system (warm ink ground, cream paper, rouge accent, DM Serif + Outfit), NOT
 * on the inherited Proalign template.
 *
 * GUARDRAIL: not one invented number on this page. Every figure is a price, a
 * duration or a capacity — all true, all verifiable.
 *
 * ── Design system (added in the premium pass) ───────────────────────────────
 * Everything visual now comes from the four scales below: T (colour), SP
 * (space), RA (radius), FS (type). Before this, ~40 hand-written rgba literals
 * and half-pixel font sizes were copy-pasted between sections, which is why
 * every section looked identical — there was no system to vary, only defaults
 * to repeat. Add a variation by composing these, never by inventing a literal.
 */

/* ── Where the video lives ────────────────────────────────────────────────
   The site is on Vercel; the video is on Cloudflare R2. Set
   NEXT_PUBLIC_VIDEO_BASE to the R2 public base URL (no trailing slash) and every
   path below follows it. Unset, it falls back to /videos so local development
   works from public/videos — which is gitignored, so 346 MB of video never
   enters the repo. */
const V = process.env.NEXT_PUBLIC_VIDEO_BASE || '/videos';

/* ── Colour (from umevio.com :root) ───────────────────────────────────────── */
const T = {
  warmDark: '#1C1208',
  ink: '#141010',
  surface: '#2A1F12',
  surface2: '#332618',
  rouge: '#D94F3D',
  rougeLit: '#E2654F',
  turmeric: '#E8A838',
  sage: '#5C7A5F',
  dust: '#F0E9DF',
  paper: '#FAF6F0',
  muted: '#A89880',
  /* Lifted from #6B5A47. That measured 2.86:1 on ink and 2.44:1 on surface —
     failing AA even for large text — and was carrying the pricing sub-line, the
     hero caption, the whole strip and the footer. Muddy small type is one of
     the most reliable "cheap" tells. This clears 4.5:1 and still recedes. */
  dim: '#8A7660',
  /* Ink-side equivalent, for the inverted (paper-ground) section. */
  inkMuted: '#6B5A47',
};

/* ── Space — one scale, no arbitrary gaps ─────────────────────────────────── */
const SP = { xs: 6, sm: 10, md: 16, lg: 24, xl: 34, xxl: 52, huge: 76 } as const;

/* ── Radius — three steps, not eleven ─────────────────────────────────────── */
const RA = { sm: 14, md: 22, lg: 30, pill: 999 } as const;

/* ── Type — a real ratio scale. The old sizes (12.5 / 13.5 / 15.5 / 16.5 / 19 /
   44 / 46) were fussed half-pixels: nothing wrong individually, collectively
   improvised. ───────────────────────────────────────────────────────────── */
const FS = { xs: 13, sm: 15, base: 17, md: 21, lg: 28, xl: 38, xxl: 52, huge: 76 } as const;

const SERIF = 'var(--font-dmserif), Georgia, serif';

/* ── Section padding — the page rhythm now alternates instead of repeating a
   single clamp() five times. ────────────────────────────────────────────── */
const PAD = {
  tight: 'clamp(48px, 6vw, 68px)',
  normal: 'clamp(58px, 8vw, 88px)',
  wide: 'clamp(76px, 10vw, 124px)',
} as const;

/**
 * The card recipe.
 *
 * The old cards all wore `1px solid rgba(240,233,223,.10)` — a full-perimeter
 * 10%-white hairline on a dark gradient. That is the 2022 Linear/Vercel look; it
 * reads generic-tech and fights the warm-editorial direction in CLAUDE.md.
 * Cards are now separated by *value and space*, with a single top-edge inset
 * highlight that reads as light falling on an edge rather than a drawn box.
 */
function card(opts: { lit?: boolean; radius?: number } = {}): CSSProperties {
  const { lit = false, radius = RA.md } = opts;
  return {
    height: '100%',
    borderRadius: radius,
    background: lit
      ? `linear-gradient(180deg, rgba(217,79,61,.17) 0%, ${T.ink} 58%)`
      : `linear-gradient(180deg, ${T.surface2} 0%, ${T.ink} 100%)`,
    boxShadow: lit
      ? `inset 0 1px 0 rgba(226,101,79,.42), 0 1px 0 rgba(217,79,61,.20), 0 26px 60px rgba(0,0,0,.34)`
      : `inset 0 1px 0 rgba(255,255,255,.07), 0 18px 44px rgba(0,0,0,.26)`,
  };
}

/* ── Reveal on scroll ─────────────────────────────────────────────────────── */
/**
 * Two paths, by capability.
 *
 * Where the browser supports CSS scroll-driven animation, the reveal is tied to
 * scroll *progress* via `animation-timeline: view()` — continuous, scrubbable,
 * and the thing that separates a page that feels expensive from one that fires
 * a binary fade. No JS, no observer.
 *
 * Everywhere else, the old IntersectionObserver still runs.
 */
function supportsViewTimeline() {
  /* window.CSS, not the bare CSS global: in a .tsx the unqualified name
     resolves to a type, not the CSSOM object. */
  return typeof window !== 'undefined'
    && typeof window.CSS?.supports === 'function'
    && window.CSS.supports('animation-timeline: view()');
}

function useReveal<E extends HTMLElement>() {
  const ref = useRef<E>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      supportsViewTimeline() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="reveal"
      data-shown={shown ? 'true' : 'false'}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * The work rail.
 *
 * A native horizontal scroller that drifts on its own until someone interacts,
 * then gets out of the way. Two things have to be true at once: the visitor can
 * reach any video immediately (scroll, swipe, drag, arrows), and the strip still
 * advertises itself when nobody is touching it.
 *
 * The track renders its items twice, so the drift can wrap by subtracting half
 * the scroll width — the seam is invisible because the content either side of it
 * is identical.
 */
const RAIL_SPEED = 42; // px per second

function useRail() {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  /* Hover pausing covers the mouse. Touch has no hover, and the drag handlers
     deliberately leave touch to the browser — so without this the drift would
     keep adding scrollLeft while a finger is mid-swipe and all through the
     momentum afterwards, i.e. the strip would fight the user on every phone. */
  const idleUntil = useRef(0);
  /* The grab cursor is toggled straight on the node rather than through React
     state. Re-rendering the page on pointerdown is both wasteful and, before
     Tile was hoisted, actively broke clicking — there is no reason for a cursor
     change to go through the render tree at all. */
  const setDragAttr = (v: boolean) => { ref.current?.setAttribute('data-drag', v ? 'true' : 'false'); };

  /* Consulted by the tile's click handler: a drag that ends over a tile must not
     also open that tile's video. */
  const movedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* The wrap distance is the width of ONE copy of the list, measured as the
       gap between the first tile and its duplicate. Deriving it from
       scrollWidth / 2 would be wrong: the track carries 16px of padding on both
       ends, so half the scroll width overshoots a copy by 8px and the seam
       visibly jumps every lap. */
    let copyW = 0;
    const measure = () => {
      const tiles = el.querySelectorAll<HTMLElement>('.mq-tile');
      const n = tiles.length / 2;
      copyW = n >= 1 && tiles[n] ? tiles[n].offsetLeft - tiles[0].offsetLeft : 0;
    };
    measure();

    /* Start just off zero. The backward wrap below triggers at the left edge,
       and a rail that loads with the pointer already over it (so the drift is
       paused, so scrollLeft never leaves 0) would otherwise jump a whole copy
       on its first frame. */
    if (el.scrollLeft === 0) el.scrollLeft = 2;

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    /* Any hands-on input parks the drift for a moment. touchmove refreshes the
       window continuously, so a long swipe plus its momentum is fully covered. */
    const HOLD = 2500;
    const hold = () => { idleUntil.current = performance.now() + HOLD; };
    const holdEvents: (keyof HTMLElementEventMap)[] = ['touchstart', 'touchmove', 'touchend', 'wheel'];
    holdEvents.forEach((n) => el.addEventListener(n, hold, { passive: true }));

    const wrap = () => {
      if (copyW <= 0) return;
      if (el.scrollLeft >= copyW) el.scrollLeft -= copyW;
      else if (el.scrollLeft <= 1) el.scrollLeft += copyW;
    };

    /* Manual scrolling has to wrap too, otherwise dragging simply hits the end
       of the strip. This runs even under reduced motion, where the rail does not
       drift but is still fully scrollable. */
    el.addEventListener('scroll', wrap, { passive: true });

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    if (!still) {
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(now - last, 64) / 1000; // clamped, so a backgrounded tab does not lurch
        last = now;
        if (!paused.current && !drag.current.active && now >= idleUntil.current) {
          el.scrollLeft += RAIL_SPEED * dt;
          wrap();
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('scroll', wrap);
      holdEvents.forEach((n) => el.removeEventListener(n, hold));
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    /* Touch is left to the browser: native momentum scrolling beats anything
       reimplemented here. This is only for mouse and pen. */
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    movedRef.current = false;
    setDragAttr(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 6) { drag.current.moved = true; movedRef.current = true; }
    el.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragAttr(false);
    /* Cleared on the next frame so the click that follows this pointerup can
       still see that a drag happened. */
    requestAnimationFrame(() => { movedRef.current = false; });
  };

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const tile = el.querySelector('.mq-tile') as HTMLElement | null;
    const step = (tile?.offsetWidth ?? 220) + 16;
    idleUntil.current = performance.now() + 1200; // let the smooth scroll land
    el.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
  };

  return {
    ref, movedRef, nudge, endDrag,
    onPointerDown, onPointerMove,
    pause: () => { paused.current = true; },
    resume: () => { paused.current = false; },
  };
}

/* ── Section eyebrow ──────────────────────────────────────────────────────── */
/**
 * Eyebrow colour used to be arbitrary — rouge, turmeric and sage appeared
 * across sections with no rule, which reads as improvisation. It is now
 * systematic: rouge = process (how the thing works), turmeric = proof (evidence
 * you can check), sage = ethics (what I won't do).
 */
const EYEBROW = { process: T.rouge, proof: T.turmeric, ethics: T.sage } as const;

function Eyebrow({ tone, children, onPaper = false }: { tone: keyof typeof EYEBROW; children: ReactNode; onPaper?: boolean }) {
  return (
    <p style={{
      fontSize: FS.xs,
      letterSpacing: '.18em',
      textTransform: 'uppercase',
      fontWeight: 600,
      /* Sage at its brand value is too light to sit on paper; this is the same
         hue darkened until it clears AA against #FAF6F0. */
      color: onPaper && tone === 'ethics' ? '#43593F' : EYEBROW[tone],
      margin: `0 0 ${SP.md}px`,
    }}>{children}</p>
  );
}

/* ── Inline SVG icons (never emoji) ───────────────────────────────────────── */
const Icon = {
  camera: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  ),
  clock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  spark: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
    </svg>
  ),
  user: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  arrow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1112 20.2z" />
    </svg>
  ),
};

/* ── Content ──────────────────────────────────────────────────────────────── */

const PROBLEMS = [
  { icon: Icon.camera, title: 'Week three', body: "You start posting video with real intent. By week three the filming has quietly stopped, and you know it." },
  { icon: Icon.clock, title: 'The editing tax', body: "An editor takes a week per video, and you're out of things to send them anyway." },
  { icon: Icon.spark, title: 'The AI look', body: "You've tried the tools. The output screams AI, and you're not putting that under your name." },
  { icon: Icon.user, title: "You're the product", body: 'Nobody else can make this content. Which is exactly why it never gets made.' },
];

const STEPS = [
  { n: '01', t: 'Record once', d: 'Fifteen minutes, on your phone, sitting down. I tell you exactly what to say. That is the whole ask, for the entire engagement, not just the first month.' },
  { n: '02', t: 'Send a topic', d: 'A sentence is enough. I research it, write the script, and send it to you. Nothing renders until you reply "ok".' },
  { n: '03', t: 'Get finished videos', d: 'Script written, video made, captions and music on it, ready to post. You will never get raw AI output with your face on it.' },
];

/* `was` (optional) carries a genuine introductory price, shown against the struck
   standard price. The 2026-09-26 repricing dropped every introductory discount
   (the trial is credited to month 1 instead), so no tier sets it today; the
   render path stays for when one returns.
   Every figure here comes from the founder-confirmed table in
   clients/umevio/growth-system/12-ai-video-growth-plan.md §5.3. Change the plan
   first, then this file — never improvise a price here. */
type Tier = { name: string; price: string; note: string; bullets: string[]; hot: boolean; risk: boolean; was?: string; wasLabel?: string };
const TIERS: Tier[] = [
  { name: 'Try one', price: '₹4,999', note: 'a single finished video', bullets: ['One reel, start to finish', 'Script written for you', 'Fully credited to your first month if you continue'], hot: false, risk: true },
  { name: 'Content engine', price: '₹14,999', note: 'per month · 4 finished reels', bullets: ['One reel every week', 'Avatar + voice setup free', 'You approve every script', 'No lock-in, cancel any month'], hot: true, risk: false },
  { name: 'Double volume', price: '₹26,999', note: 'per month · 8 finished reels', bullets: ['Two reels every week', 'Everything in the engine', 'Only 2 clients at this volume'], hot: false, risk: false },
];

const FAQS = [
  { q: 'Will my audience feel tricked?', a: 'They should not, because nothing is hidden. The video is labelled as AI, the words are yours, and you approve every script before it exists. Where a platform asks for an AI label, it gets one. The people who get into trouble here are the ones pretending, and that is a choice they made, not something the format did to them.' },
  { q: "Can't I just do this myself with the software?", a: 'In principle, yes, the tools are available to anyone. But the software is the easy part. What you would still be doing every single week is choosing the topic, researching it, writing a script that sounds like you, generating, cutting, captioning, scoring and actually shipping it. That is the work, and that is what I sell. If you have those hours free and enjoy that craft, do it yourself. I mean that.' },
  { q: 'How much of my time does this actually take?', a: 'One fifteen-minute recording at the start. After that: send a topic, reply "ok" to a script. That is the whole ongoing commitment.' },
  { q: 'Are you an agency?', a: 'No. One person, me. I run the ads, write the scripts and edit the videos myself. No account managers, nothing handed to a junior. That is also why the client count is capped.' },
  { q: 'What if I hate the result?', a: 'Buy one video for ₹4,999 and find out before committing to anything monthly. If you continue, that ₹4,999 comes off your first month. There is no setup fee and no lock-in on the monthly plan either. If it stops working, stop, and I hand your recording back.' },
  { q: 'Is this allowed on Instagram and YouTube?', a: 'Yes, with disclosure. Both platforms ask you to label realistic AI-generated content, and that label gets applied. The rules exist to stop people passing synthetic footage off as real, which is the opposite of how this is built.' },
  { q: 'Whose account does my avatar live in?', a: 'Mine, operated under a written agreement. It is used only for scripts you approved, never shown or transferred to anyone, deleted within seven days if you ask. Your original recording stays yours and I will send you a copy whenever you want it, so you can rebuild elsewhere if you ever leave.' },
];

/* The work wall. Every item is a real delivered piece — nothing here is a mockup.
   Client names appear with the founder's authorisation (2026-08-12); he owns those
   relationships and confirmed he would speak to them directly. */
const LIBRARY = [
  { s: 'd1', v: `${V}/d1-hero.mp4`, p: '/images/ai-video/d1-poster.webp', c: 'Umevio', t: 'Record once, post daily' },
  { s: 'pro-cost', v: `${V}/pro-cost.mp4`, p: '/images/ai-video/library/pro-cost.webp', c: 'Proalign', t: 'What braces actually cost' },
  { s: 'mpi-secret', v: `${V}/mpi-secret.mp4`, p: '/images/ai-video/library/mpi-secret.webp', c: 'MPI Invest', t: 'A secret in investing' },
  { s: 'mpi-skills', v: `${V}/mpi-skills.mp4`, p: '/images/ai-video/library/mpi-skills.webp', c: 'MPI Invest', t: 'Skills over salary' },
  { s: 'pro-age', v: `${V}/pro-age.mp4`, p: '/images/ai-video/library/pro-age.webp', c: 'Proalign', t: 'Is there an age limit?' },
  { s: 'mpi-dubai', v: `${V}/mpi-dubai.mp4`, p: '/images/ai-video/library/mpi-dubai.webp', c: 'MPI Invest', t: 'The Dubai job' },
  { s: 'd2', v: `${V}/d2-beforeafter.mp4`, p: '/images/ai-video/d2-poster.webp', c: 'Umevio', t: 'Raw vs finished' },
  { s: 'mpi-emi', v: `${V}/mpi-emi.mp4`, p: '/images/ai-video/library/mpi-emi.webp', c: 'MPI Invest', t: 'EMI or balance?' },
  { s: 'pro-aligners', v: `${V}/pro-aligners.mp4`, p: '/images/ai-video/library/pro-aligners.webp', c: 'Proalign', t: 'Clear aligners, honestly' },
  { s: 'mpi-everest', v: `${V}/mpi-everest.mp4`, p: '/images/ai-video/library/mpi-everest.webp', c: 'MPI Invest', t: 'Your own Everest' },
  { s: 'pro-rules', v: `${V}/pro-rules.mp4`, p: '/images/ai-video/library/pro-rules.webp', c: 'Proalign', t: 'The aligner rules' },
  { s: 'mpi-third', v: `${V}/mpi-third.mp4`, p: '/images/ai-video/library/mpi-third.webp', c: 'MPI Invest', t: 'A third property' },
  { s: 'mpi-nro', v: `${V}/mpi-nro.mp4`, p: '/images/ai-video/library/mpi-nro.webp', c: 'MPI Invest', t: 'NRO accounts and TDS' },
  { s: 'mpi-retire', v: `${V}/mpi-retire.mp4`, p: '/images/ai-video/library/mpi-retire.webp', c: 'MPI Invest', t: 'Will AI plan your retirement?' },
];

/* One rail, carrying the whole library. Earlier passes split it (two
   counter-scrolling rows, then a rail plus a static grid) — both restated the
   same work twice. The rail alone shows every piece at full size and keeps the
   section to a single gesture. */
const WALL_MARQUEE = LIBRARY;

const MANIFESTO = [
  'Umevio uses AI replicas — with the written consent of the person cloned, script approval before anything renders, and platform AI labels wherever a viewer could mistake a replica for a live recording.',
  'We never build synthetic customers, fake testimonials, or anyone’s likeness without their personal consent. If that is what a project needs, we are the wrong studio.',
  'The system I build these in will not render a made-up number. It is a check that runs before anything ships, and a video that breaks it does not go out.',
  'I take six video clients at most. That is arithmetic rather than a sales tactic. This runs alongside other work, and six is the point where the quality would start to slip.',
];

/* ── Page CSS ─────────────────────────────────────────────────────────────── */

const CSS = `
        /* ── Reveal ──
           Fallback path: a transition flipped by IntersectionObserver.
           Enhanced path: tied to scroll progress, so the motion scrubs with the
           page instead of firing once. */
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1); }
        .reveal[data-shown="true"] { opacity: 1; transform: none; }
        @supports (animation-timeline: view()) {
          .reveal { opacity: 1; transform: none; transition: none;
            animation: rv-rise linear both;
            animation-timeline: view();
            animation-range: entry 4% cover 24%; }
          @keyframes rv-rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
        }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1 !important; transform: none !important; transition: none !important; animation: none !important; } }

        /* ── Grain ──
           Replaces the old 64px line grid, which was a startup-dashboard motif
           fighting a warm-editorial brand. This is paper tooth: it reads as
           print stock rather than a dev tool. */
        .av-grain { position: relative; isolation: isolate; }
        .av-grain::after { content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 1; opacity: .55;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          background-size: 200px 200px; mix-blend-mode: overlay; }
        .av-grain > * { position: relative; z-index: 2; }
        .av-grain--paper::after { mix-blend-mode: multiply; opacity: .42; }

        .av-btn { transition: background-color .2s ease, color .2s ease, box-shadow .2s ease, transform .2s ease; }
        .av-btn:hover { transform: translateY(-1px); }
        .av-card { transition: box-shadow .28s ease, transform .28s ease; }
        a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, summary:focus-visible {
          outline: 2px solid ${T.turmeric}; outline-offset: 3px; border-radius: 6px;
        }
        .av-in::placeholder { color: ${T.dim}; }

        /* Custom select chevron. The native control was rendering the OS arrow
           and OS option list — a grey Windows dropdown in the middle of a dark
           form, and the most visible break in the design. */
        .av-select { -webkit-appearance: none; -moz-appearance: none; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9' fill='none'%3E%3Cpath d='M1 1l6 6 6-6' stroke='%23A89880' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 18px center; padding-right: 46px !important; }
        .av-select option { background: ${T.ink}; color: ${T.dust}; }

        /* ── Wordmark ── no nav links, no escape routes; just proof of who this
           is. Previously the brand did not appear until the footer, so a cold ad
           click scrolled the entire page without ever seeing it. */
        .av-mark { position: absolute; top: clamp(20px, 3vw, 30px); left: 20px; z-index: 3; text-decoration: none;
          font-family: ${SERIF}; font-size: ${FS.md}px; color: ${T.paper}; letter-spacing: -.01em; line-height: 1; }
        @media (min-width: 1160px) { .av-mark { left: calc((100vw - 1120px) / 2); } }

        /* ── The work wall ──
           A real horizontal scroller that also drifts on its own, rather than a
           CSS-animated track. The animation-only version made you wait for a
           given video to come round; now every input gets through — trackpad
           swipe, touch, click-drag, and the arrow buttons — and the drift stops
           the moment anyone touches it. The auto-scroll lives in JS because a
           transform animation and native scrolling cannot share one element. */
        .mq-wrap { position: relative; }
        .mq { overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain;
          scrollbar-width: none; -ms-overflow-style: none; cursor: grab;
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%); }
        .mq::-webkit-scrollbar { display: none; }
        .mq[data-drag="true"] { cursor: grabbing; }
        .mq-track { display: flex; gap: 16px; width: max-content; padding: 2px 16px; }

        /* Arrows — the one affordance a mouse-wheel user has, since a vertical
           wheel does not move a horizontal scroller. Pointer devices only. */
        .mq-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 4;
          width: 46px; height: 46px; border-radius: ${RA.pill}px; border: none; display: none;
          place-items: center; cursor: pointer; color: ${T.dust};
          background: rgba(20,16,16,.82); backdrop-filter: blur(8px);
          box-shadow: inset 0 0 0 1px rgba(240,233,223,.20), 0 8px 26px rgba(0,0,0,.44);
          transition: background-color .2s ease, color .2s ease, transform .2s ease; }
        @media (min-width: 768px) and (hover: hover) { .mq-nav { display: grid; } }
        .mq-nav:hover { background: ${T.rouge}; color: ${T.paper}; }
        .mq-nav--prev { left: 14px; }
        .mq-nav--next { right: 14px; }

        .mq-tile { position: relative; flex: 0 0 auto; width: 208px; border-radius: ${RA.sm}px; overflow: hidden;
          border: none; background: ${T.ink}; padding: 0; display: block; cursor: pointer; aspect-ratio: 9 / 16;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 16px 40px rgba(0,0,0,.34);
          transition: box-shadow .25s ease, transform .25s ease; }
        .mq-tile:hover { transform: translateY(-4px);
          box-shadow: inset 0 0 0 1px rgba(217,79,61,.62), 0 22px 52px rgba(0,0,0,.46); }
        .mq-tile img, .mq-tile video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .mq-tile video { position: absolute; inset: 0; z-index: 2; }
        .mq-play { position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: ${RA.pill}px;
          display: grid; place-items: center; background: rgba(217,79,61,.92); color: ${T.paper}; z-index: 3;
          transition: opacity .2s ease; }
        .mq-tile[data-preview="true"] .mq-play { opacity: 0; }
        .mq-meta { position: absolute; left: 0; right: 0; bottom: 0; padding: 46px 13px 12px; text-align: left; z-index: 3;
          background: linear-gradient(180deg, rgba(20,16,16,0) 0%, rgba(20,16,16,.78) 38%, rgba(20,16,16,.97) 72%); }
        @media (min-width: 768px) { .mq-tile { width: 268px; } }

        /* ── Two-column on desktop ──
           A 9:16 video in a full-width column leaves a huge void beside it on a
           laptop. These sections put the copy next to the video instead. */
        .split { display: grid; gap: ${SP.xl}px; }
        .split-media { justify-self: start; width: 100%; max-width: 356px; }
        @media (min-width: 920px) {
          .split { grid-template-columns: 1.05fr 0.95fr; gap: 60px; align-items: center; }
          .split-media { justify-self: end; margin-top: 0 !important; max-width: 400px; }
          .split-copy { max-width: 560px; }
        }

        /* ── Hero cover ── a still of the 1080 master + a play affordance ── */
        .hero-cover { position: relative; display: block; width: 100%; padding: 0; border: none;
          background: ${T.ink}; border-radius: 19px; overflow: hidden; cursor: pointer; }
        .hero-cover img { width: 100%; height: auto; display: block; }
        .hc-scrim { position: absolute; inset: 0; background:
          linear-gradient(180deg, rgba(20,16,16,.55) 0%, rgba(20,16,16,0) 30%, rgba(20,16,16,0) 52%, rgba(20,16,16,.86) 100%); }
        .hc-tag { position: absolute; top: 14px; left: 14px; display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 13px; border-radius: ${RA.pill}px; background: rgba(20,16,16,.72);
          box-shadow: inset 0 0 0 1px rgba(217,79,61,.5);
          color: ${T.dust}; font-size: ${FS.xs}px; letter-spacing: .16em; font-weight: 600; backdrop-filter: blur(6px); }
        .hc-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 76px; height: 76px; border-radius: ${RA.pill}px; display: grid; place-items: center;
          background: ${T.rouge}; color: ${T.paper}; padding-left: 5px;
          box-shadow: 0 0 0 10px rgba(217,79,61,.16), 0 0 0 22px rgba(217,79,61,.07), 0 16px 44px rgba(0,0,0,.5);
          transition: transform .2s ease, box-shadow .2s ease; }
        .hero-cover:hover .hc-play { transform: translate(-50%,-50%) scale(1.06);
          box-shadow: 0 0 0 12px rgba(217,79,61,.22), 0 0 0 26px rgba(217,79,61,.09), 0 16px 44px rgba(0,0,0,.5); }
        .hc-foot { position: absolute; left: 16px; right: 16px; bottom: 15px; display: flex; align-items: flex-end;
          justify-content: space-between; gap: 12px; text-align: left; }
        .hc-line { color: ${T.paper}; font-size: ${FS.sm}px; line-height: 1.35; font-weight: 500; max-width: 230px;
          text-shadow: 0 2px 14px rgba(0,0,0,.8); }
        .hc-dur { color: ${T.dust}; font-size: ${FS.xs}px; letter-spacing: .08em; padding: 5px 10px; border-radius: ${RA.pill}px;
          background: rgba(20,16,16,.7); box-shadow: inset 0 0 0 1px rgba(240,233,223,.18); flex-shrink: 0; }
        .player-box { max-width: min(400px, calc((100vh - 150px) * 0.5625)); }
        @media (min-width: 768px) { .player-box { max-width: min(480px, calc((100vh - 160px) * 0.5625)); } }

        /* ── Steps rail ──
           The rule above each step draws itself as you scroll through the
           section, so the three steps read as a sequence being traversed rather
           than three cards that happen to be numbered. */
        .rail { height: 1px; transform-origin: left center; background: linear-gradient(90deg, ${T.rouge}, rgba(217,79,61,0)); }
        @supports (animation-timeline: view()) {
          .rail { transform: scaleX(0); animation: rail-draw linear both; animation-timeline: view(); animation-range: entry 12% cover 42%; }
          @keyframes rail-draw { to { transform: scaleX(1); } }
        }
        @media (prefers-reduced-motion: reduce) { .rail { animation: none !important; transform: none !important; } }

        /* ── Floating WhatsApp ──
           Always on, bottom-right, above everything except the video player.
           Hidden below 768px because the sticky bar already carries a WhatsApp
           button there, and two of the same control stacked in the thumb zone
           is worse than one. It widens to show its label on hover; the label is
           always in the accessible name regardless. */
        .av-fab { position: fixed; right: clamp(18px, 2.4vw, 30px); bottom: clamp(18px, 2.4vw, 30px); z-index: 55;
          display: none; align-items: center; gap: 0;
          height: 58px; padding: 0 17px; border-radius: ${RA.pill}px; text-decoration: none;
          background: ${T.rouge}; color: ${T.paper};
          box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 10px 30px rgba(217,79,61,.36), 0 2px 10px rgba(0,0,0,.34);
          transition: gap .28s cubic-bezier(.22,.61,.36,1), padding .28s cubic-bezier(.22,.61,.36,1),
                      background-color .2s ease, box-shadow .25s ease, transform .2s ease; }
        @media (min-width: 768px) { .av-fab { display: inline-flex; } }
        .av-fab svg { width: 25px; height: 25px; flex-shrink: 0; }
        .av-fab-label { max-width: 0; opacity: 0; overflow: hidden; white-space: nowrap; font-size: ${FS.sm}px; font-weight: 600;
          transition: max-width .28s cubic-bezier(.22,.61,.36,1), opacity .2s ease; }
        .av-fab:hover, .av-fab:focus-visible { background: ${T.rougeLit}; transform: translateY(-2px);
          gap: 11px; padding: 0 23px 0 19px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.26), 0 16px 40px rgba(217,79,61,.46), 0 2px 10px rgba(0,0,0,.34); }
        .av-fab:hover .av-fab-label, .av-fab:focus-visible .av-fab-label { max-width: 170px; opacity: 1; }
        /* A pulse that runs three times and stops, so it draws the eye once
           without becoming a thing flashing on the page forever. */
        .av-fab::before { content: ''; position: absolute; inset: 0; border-radius: inherit;
          box-shadow: 0 0 0 0 rgba(217,79,61,.55); animation: fab-pulse 2.4s ease-out 3; }
        @keyframes fab-pulse { to { box-shadow: 0 0 0 18px rgba(217,79,61,0); } }
        @media (prefers-reduced-motion: reduce) {
          .av-fab, .av-fab-label { transition: none; }
          .av-fab::before { animation: none; }
        }

        /* ── Sticky bar ──
           Was position:fixed unconditionally, so a 1440px desktop got a
           full-width mobile call/WhatsApp bar pinned across the bottom. It is a
           thumb-reach affordance; it belongs on phones only. */
        .av-sticky { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; display: flex; gap: 10px;
          padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
          background: rgba(20,16,16,.92); backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(240,233,223,.12); }
        @media (min-width: 768px) { .av-sticky { display: none; } }
        .av-tailpad { height: 108px; }
        @media (min-width: 768px) { .av-tailpad { height: 0; } }
      `;

/**
 * One tile, shared by every position in the rail.
 *
 * Defined at module scope on purpose. It previously lived inside
 * AiVideoLanding, which gave it a fresh component identity on every parent
 * render — so React tore down and rebuilt every tile's DOM node whenever any
 * state changed. Pressing the mouse fired setDragging, which re-rendered the
 * parent, which replaced the node mid-click: mousedown landed on one element
 * and mouseup on its replacement, and a click event only fires when both hit
 * the same element. The result was that tiles could never be opened with a
 * mouse, while touch was fine because the drag handlers ignore touch entirely.
 */
const Tile = memo(function Tile({
  item, k, active, canHover, onOpen, onHover, onLeave,
}: {
  item: (typeof LIBRARY)[number];
  k: string;
  active: boolean;
  canHover: boolean;
  onOpen: (item: (typeof LIBRARY)[number]) => void;
  onHover: (k: string) => void;
  onLeave: (k: string) => void;
}) {
  return (
    <button
      onClick={() => onOpen(item)}
      onMouseEnter={() => { if (canHover) onHover(k); }}
      onMouseLeave={() => onLeave(k)}
      onFocus={() => { if (canHover) onHover(k); }}
      onBlur={() => onLeave(k)}
      aria-label={`Play: ${item.c} — ${item.t}`}
      className="mq-tile"
      data-preview={active ? 'true' : 'false'}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.p} alt="" width={360} height={640} loading="lazy" decoding="async" />
      {/* Muted, looping, preload="none": nothing is fetched until a pointer
          actually lands on the tile, and only one tile is ever mounted at a
          time, so the wall costs no bandwidth until someone is interested.
          Muted is not a choice — browsers refuse to autoplay audio without a
          gesture, so a hover preview can only ever be silent. Sound arrives
          when the tile is opened, which is a real click. */}
      {active && (
        <video src={item.v} muted loop autoPlay playsInline preload="none" aria-hidden tabIndex={-1} />
      )}
      <span className="mq-play" aria-hidden>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <span className="mq-meta">
        <span style={{ color: T.turmeric, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', display: 'block' }}>{item.c}</span>
        <span style={{ color: T.paper, fontSize: FS.sm - 1, lineHeight: 1.3, display: 'block', marginTop: 2 }}>{item.t}</span>
      </span>
    </button>
  );
});

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function AiVideoLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [playing, setPlaying] = useState<(typeof LIBRARY)[number] | null>(null);
  const [heroOn, setHeroOn] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);
  const rail = useRail();

  /* Stable identities, so the memoised tiles are not invalidated on every
     parent render. openTile still honours the drag guard: a drag that happens
     to finish over a tile must not also open that tile. */
  const openTile = useCallback((item: (typeof LIBRARY)[number]) => {
    if (!rail.movedRef.current) setPlaying(item);
  }, [rail.movedRef]);
  const hoverTile = useCallback((k: string) => setPreview(k), []);
  const leaveTile = useCallback((k: string) => setPreview((p) => (p === k ? null : p)), []);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [work, setWork] = useState('');
  const [blocker, setBlocker] = useState('');
  const [budget, setBudget] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const wa = `https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hi Sreevin — I saw the AI video page and I'd like to know more.")}`;

  /* The pixel and the server send the same event under one event_id, so Meta
     counts it once but still gets it when an ad blocker or iOS eats the pixel.
     Phone and name go to our own /api/capi and are hashed there; only the hash
     reaches Meta. Fire-and-forget: tracking must never block a lead or a tap. */
  function track(event: 'Lead' | 'Contact', match: { phone?: string; name?: string }, gtm: Record<string, string>) {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { fbq?: (...a: unknown[]) => void; dataLayer?: unknown[] };
    const eventId = crypto.randomUUID();
    const cookie = (k: string) => document.cookie.match(new RegExp(`(?:^|; )${k}=([^;]*)`))?.[1];
    w.fbq?.('track', event, {}, { eventID: eventId });
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event_name: event, event_id: eventId, page_url: window.location.href,
        ...match, fbp: cookie('_fbp'), fbc: cookie('_fbc'),
      }),
    }).catch(() => {});
    w.dataLayer?.push({ ...gtm, event_id: eventId });
  }
  /* WhatsApp and Call are enquiries too; without these the ads would look
     like they produced nothing whenever someone chose to message instead. */
  const onWa = () => track('Contact', {}, { event: 'contact', channel: 'whatsapp' });
  const onCall = () => track('Contact', {}, { event: 'contact', channel: 'call' });

  /* Hover-to-preview is a pointer affordance. On touch it would fire on tap and
     fight the tap-to-open-player behaviour, so it is gated on a real hover
     device and on the visitor not having asked for reduced motion. */
  useEffect(() => {
    const ok = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanHover(ok);
  }, []);

  /* Esc closes the player, and the page behind it must not scroll while it's open. */
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPlaying(null); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [playing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))) {
      setErr('That does not look like a valid 10-digit Indian mobile number.');
      return;
    }
    setSending(true);
    try {
      if (!client.formEndpoint) throw new Error('no endpoint configured');
      /* Formspree accepts JSON and answers with CORS, so unlike a no-cors post we
         can actually tell whether it worked. If it did not, the visitor is told
         and pointed at WhatsApp rather than shown a success screen for a lead
         that never arrived. */
      const res = await fetch(client.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, phone, work, blocker, budget,
          source: '/ai-video',
          _subject: `AI video enquiry — ${name || 'no name'}`,
        }),
      });
      if (!res.ok) throw new Error(`formspree ${res.status}`);
      track('Lead', { phone, name }, { event: 'generate_lead', form: 'ai-video' });
      setSent(true);
    } catch {
      setErr('That did not send. WhatsApp me instead, that always works.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ background: T.warmDark, color: T.dust, minHeight: '100vh', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="av-grain" style={{ position: 'relative', padding: `clamp(74px, 9vw, 104px) 20px ${PAD.tight}` }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(72% 46% at 50% 0%, rgba(217,79,61,.20) 0%, rgba(28,18,8,0) 68%)`, pointerEvents: 'none' }} />

        <a href="#start" className="av-mark" aria-label="Umevio — go to the enquiry form">
          ume<span style={{ color: T.rouge }}>vio</span>
        </a>

        <div className="split" style={{ position: 'relative', maxWidth: 1120, margin: '0 auto' }}>

          <div className="split-copy">
          <Reveal>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: `inset 0 0 0 1px rgba(217,79,61,.35)`, background: 'rgba(217,79,61,.09)', color: T.rougeLit, borderRadius: RA.pill, padding: '8px 16px', fontSize: FS.xs, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: RA.pill, background: T.rouge, display: 'inline-block' }} />
              AI Video Content Engine
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(46px, 9.4vw, 88px)', lineHeight: 1.0, letterSpacing: '-0.025em', margin: `${SP.lg}px 0 0`, color: T.paper, maxWidth: 900 }}>
              Record once.<br />Post <span style={{ color: T.rouge }}>every day</span>.
            </h1>
          </Reveal>

          {/* The editorial lede. Italic serif at reading size is the single
              cheapest upgrade in perceived quality available on this page —
              before this, every word of body copy was Outfit. */}
          <Reveal delay={120}>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(19px, 2.4vw, 25px)', lineHeight: 1.5, color: T.dust, margin: `${SP.lg}px 0 0`, maxWidth: 580 }}>
              AI video for coaches and founders who can&rsquo;t keep filming.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p style={{ fontSize: FS.base, lineHeight: 1.66, color: T.muted, margin: `${SP.md}px 0 0`, maxWidth: 560 }}>
              You sit down once for fifteen minutes. After that I write the scripts and make the videos for the rest of the month, you okay every one before it goes out, and they all say they&rsquo;re AI.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: `${SP.xl}px 0 0` }}>
              <a href="#start" className="av-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: T.rouge, color: T.paper, textDecoration: 'none', padding: '17px 30px', borderRadius: RA.pill, fontWeight: 600, fontSize: FS.base, minHeight: 44, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18), 0 18px 46px rgba(217,79,61,.30)', cursor: 'pointer' }}>
                {client.primaryCTA} {Icon.arrow}
              </a>
              <a href={wa} onClick={onWa} target="_blank" rel="noopener noreferrer" className="av-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', color: T.dust, textDecoration: 'none', padding: '17px 26px', borderRadius: RA.pill, fontWeight: 500, fontSize: FS.base, minHeight: 44, boxShadow: `inset 0 0 0 1px rgba(240,233,223,.22)`, cursor: 'pointer' }}>
                {Icon.whatsapp} WhatsApp
              </a>
            </div>
          </Reveal>

          </div>

          {/* Hero video */}
          <Reveal delay={240}>
            <figure className="split-media" style={{ margin: `${SP.xl}px 0 0` }}>
              <div style={{ position: 'relative', borderRadius: 26, padding: 8, background: `linear-gradient(160deg, rgba(217,79,61,.42), rgba(240,233,223,.06) 42%, rgba(232,168,56,.22))` }}>
                {heroOn ? (
                  <video
                    src={`${V}/d1-hero.mp4`}
                    poster="/images/ai-video/d1-poster.webp"
                    controls autoPlay playsInline
                    aria-label="Sreevin, generated from a single recording, explaining how the service works"
                    style={{ width: '100%', display: 'block', borderRadius: 19, background: T.ink }}
                  />
                ) : (
                  /* Deliberately NOT autoplaying. At full quality this file is ~14 MB, and
                     making every visitor download it before they have decided they care is
                     rude on mobile data. The poster is a still of the same 1080 master — it
                     costs 40 KB and looks perfect — so the FIRST thing anyone sees is
                     maximum quality, which is the whole argument of this page. */
                  <button onClick={() => setHeroOn(true)} className="hero-cover" aria-label="Play the demo video with sound">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/ai-video/d1-poster.webp" alt="Sreevin speaking to camera in the finished, edited video" width={1080} height={1920} />
                    <span className="hc-scrim" aria-hidden />
                    <span className="hc-tag" aria-hidden>
                      <span style={{ width: 6, height: 6, borderRadius: RA.pill, background: T.rouge, display: 'inline-block' }} />
                      100% AI · ONE RECORDING
                    </span>
                    <span className="hc-play" aria-hidden>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                    <span className="hc-foot" aria-hidden>
                      <span className="hc-line">Press play. The face and the voice are both AI.</span>
                      <span className="hc-dur">0:41</span>
                    </span>
                  </button>
                )}
              </div>
              <figcaption style={{ marginTop: 14, fontSize: FS.xs, letterSpacing: '.14em', textTransform: 'uppercase', color: T.dim }}>
                This video is AI, made from one 15-minute recording
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── STRIP ──────────────────────────────────────────────────────────── */}
      <div style={{ boxShadow: `inset 0 1px 0 rgba(240,233,223,.09), inset 0 -1px 0 rgba(240,233,223,.09)`, background: 'rgba(20,16,16,.45)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px 26px', justifyContent: 'center', fontSize: FS.xs, letterSpacing: '.1em', textTransform: 'uppercase', color: T.dim }}>
          {['One recording', 'Multiple looks', 'Scripts written for you', 'Fully edited', 'You approve everything'].map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden style={{ width: 5, height: 5, borderRadius: RA.pill, background: T.rouge }} />{s}
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ────────────────────────────────────────────────────────── */}
      <section style={{ padding: `${PAD.normal} 20px` }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <Eyebrow tone="process">Why it never happens</Eyebrow>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5.4vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.015em', color: T.paper, maxWidth: 720, margin: 0 }}>
              You already know video works. That was never the problem.
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: SP.xl }}>
            {PROBLEMS.map((p, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="av-card" style={{ ...card(), padding: '28px 24px' }}>
                  <div style={{ color: T.rouge, marginBottom: SP.md }}>{p.icon}</div>
                  <h3 style={{ fontSize: FS.md, fontWeight: 600, color: T.paper, margin: `0 0 ${SP.sm}px` }}>{p.title}</h3>
                  <p style={{ fontSize: FS.sm, lineHeight: 1.65, color: T.muted, margin: 0 }}>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROOF ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: `0 20px ${PAD.normal}` }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="split av-grain" style={{ background: `linear-gradient(150deg, rgba(217,79,61,.14), rgba(28,18,8,0) 55%), ${T.ink}`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.07), 0 30px 70px rgba(0,0,0,.28)`, borderRadius: RA.lg, padding: 'clamp(28px, 5vw, 56px)' }}>
            <div className="split-copy">
            <Reveal>
              <Eyebrow tone="proof">Don&rsquo;t take my word for it</Eyebrow>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.12, color: T.paper, margin: `0 0 ${SP.md}px`, maxWidth: 620 }}>
                &ldquo;But AI videos look fake.&rdquo;
              </h2>
              <p style={{ fontSize: FS.base, lineHeight: 1.65, color: T.muted, maxWidth: 560, margin: 0 }}>
                Mostly true, of raw output. So here is the raw render on the left and what I deliver on the right. Same recording, same script, nothing re-shot. Turn the sound on, because half the difference is audio.
              </p>
            </Reveal>
            </div>
            <Reveal delay={80}>
              <video
                className="split-media"
                src={`${V}/d2-beforeafter.mp4`}
                poster="/images/ai-video/d2-poster.webp"
                controls playsInline preload="none"
                aria-label="Split screen comparing the raw AI render with the finished, edited video"
                style={{ display: 'block', borderRadius: 20, background: T.ink, boxShadow: `inset 0 0 0 1px rgba(240,233,223,.12)` }}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── THE WALL — the strongest asset on the page, now sized like it ──── */}
      <section style={{ padding: `0 0 ${PAD.normal}` }} aria-labelledby="wall-h">
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 20px' }}>
          <Reveal>
            <Eyebrow tone="proof">The output</Eyebrow>
            {/* The one deliberately oversized statement on the page. Previously
                every h2 was clamp(30–52) and nothing was the anchor moment. */}
            <h2 id="wall-h" style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 7.4vw, 76px)', lineHeight: 1.04, letterSpacing: '-0.022em', color: T.paper, margin: `0 0 ${SP.md}px`, maxWidth: 860 }}>
              This is what a month looks like.
            </h2>
            <p style={{ fontSize: FS.base, lineHeight: 1.6, color: T.muted, margin: `0 0 ${SP.xl}px`, maxWidth: 540 }}>
              All of this is real client work. Drag or scroll the strip, then tap any one to watch it. Every video here came out of a single recording session with that person.
            </p>
          </Reveal>
        </div>

        <div className="mq-wrap" onMouseEnter={rail.pause} onMouseLeave={rail.resume} onFocus={rail.pause} onBlur={rail.resume}>
          <div
            ref={rail.ref}
            className="mq"
            data-drag="false"
            role="group"
            aria-label="Delivered videos — scroll or drag to browse"
            onPointerDown={rail.onPointerDown}
            onPointerMove={rail.onPointerMove}
            onPointerUp={rail.endDrag}
            onPointerCancel={rail.endDrag}
            onPointerLeave={rail.endDrag}
          >
            <div className="mq-track">
              {[...WALL_MARQUEE, ...WALL_MARQUEE].map((item, i) => {
                const k = `mq-${item.s}-${i}`;
                return (
                  <Tile
                    key={k} item={item} k={k}
                    active={canHover && preview === k}
                    canHover={canHover}
                    onOpen={openTile} onHover={hoverTile} onLeave={leaveTile}
                  />
                );
              })}
            </div>
          </div>

          <button type="button" className="mq-nav mq-nav--prev" onClick={() => rail.nudge(-1)} aria-label="Scroll the videos left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button type="button" className="mq-nav mq-nav--next" onClick={() => rail.nudge(1)} aria-label="Scroll the videos right">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </section>

      {/* ── HOW ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: `0 20px ${PAD.normal}` }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <Eyebrow tone="process">How it works</Eyebrow>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5.4vw, 52px)', lineHeight: 1.1, color: T.paper, margin: `0 0 ${SP.xl}px`, maxWidth: 640 }}>
              Fifteen minutes of your time. Once.
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 90}>
                <div style={{ position: 'relative', paddingTop: 30 }}>
                  <div aria-hidden className="rail" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                  <span style={{ fontFamily: SERIF, fontSize: FS.xl, color: 'rgba(240,233,223,.16)', lineHeight: 1 }}>{s.n}</span>
                  <h3 style={{ fontSize: FS.md, fontWeight: 600, color: T.paper, margin: `14px 0 ${SP.sm}px` }}>{s.t}</h3>
                  <p style={{ fontSize: FS.sm, lineHeight: 1.68, color: T.muted, margin: 0 }}>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section style={{ padding: `0 20px ${PAD.normal}` }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <Eyebrow tone="process">What it costs</Eyebrow>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5.4vw, 52px)', lineHeight: 1.1, color: T.paper, margin: `0 0 ${SP.sm}px` }}>
              No setup fee. No lock-in.
            </h2>
            <p style={{ fontSize: FS.base, color: T.muted, margin: `0 0 ${SP.xl}px`, maxWidth: 560 }}>Billed monthly in advance. Cancel any month and I hand your recording back.</p>
          </Reveal>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', alignItems: 'stretch' }}>
            {TIERS.map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="av-card" style={{
                  ...card({ lit: t.hot, radius: RA.lg }),
                  display: 'flex', flexDirection: 'column', padding: '32px 26px',
                  /* The Try-one tier is the strongest risk-reversal on the page and
                     used to sit leftmost with the least emphasis, out-designed by
                     the tier beside it. A sage edge gives it its own claim on the
                     eye without competing with the rouge of the headline tier. */
                  ...(t.risk ? { boxShadow: `inset 0 1px 0 rgba(92,122,95,.55), inset 0 0 0 1px rgba(92,122,95,.26), 0 18px 44px rgba(0,0,0,.26)` } : null),
                }}>
                  {t.hot && (
                    <span style={{ alignSelf: 'flex-start', fontSize: FS.xs - 1, letterSpacing: '.16em', textTransform: 'uppercase', color: T.ink, background: T.turmeric, borderRadius: RA.pill, padding: '6px 13px', fontWeight: 700, marginBottom: 18 }}>Most take this</span>
                  )}
                  {t.risk && (
                    <span style={{ alignSelf: 'flex-start', fontSize: FS.xs - 1, letterSpacing: '.16em', textTransform: 'uppercase', color: T.sage, boxShadow: `inset 0 0 0 1px rgba(92,122,95,.5)`, borderRadius: RA.pill, padding: '6px 13px', fontWeight: 700, marginBottom: 18 }}>Start here, risk-free</span>
                  )}
                  <p style={{ fontSize: FS.xs, letterSpacing: '.16em', textTransform: 'uppercase', color: T.muted, margin: `0 0 ${SP.sm}px` }}>{t.name}</p>
                  <p style={{ fontFamily: SERIF, fontSize: FS.xl + 8, lineHeight: 1, color: T.paper, margin: 0 }}>{t.price}</p>
                  <p style={{ fontSize: FS.sm, color: T.dim, margin: `8px 0 ${t.was ? SP.sm : SP.lg}px` }}>{t.note}</p>
                  {/* "First month ₹14,875" was a raw number in a bullet, doing no
                      work. Shown against the struck standard price it reads as
                      the concession it actually is. Both figures are true. */}
                  {t.was && (
                    <p style={{ fontSize: FS.sm, margin: `0 0 ${SP.lg}px`, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ color: T.dim, textDecoration: 'line-through' }}>{t.price}</span>
                      <span style={{ color: T.turmeric, fontWeight: 600 }}>{t.was}</span>
                      <span style={{ color: T.muted }}>{t.wasLabel}</span>
                    </p>
                  )}
                  <ul style={{ listStyle: 'none', padding: 0, margin: `0 0 ${SP.lg}px`, display: 'grid', gap: 11, alignContent: 'start', flex: 1 }}>
                    {t.bullets.map((b, j) => (
                      <li key={j} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: FS.sm, lineHeight: 1.5, color: T.dust }}>
                        <span style={{ color: t.hot ? T.turmeric : T.sage, flexShrink: 0, marginTop: 3 }}>{Icon.check}</span>{b}
                      </li>
                    ))}
                  </ul>
                  <a href="#start" className="av-btn" style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 44,
                    background: t.hot ? T.rouge : 'transparent', color: t.hot ? T.paper : T.dust,
                    boxShadow: t.hot ? 'inset 0 1px 0 rgba(255,255,255,.18)' : `inset 0 0 0 1px rgba(240,233,223,.24)`,
                    textDecoration: 'none', padding: '14px 22px', borderRadius: RA.pill, fontWeight: 600, fontSize: FS.sm, cursor: 'pointer',
                  }}>Start here {Icon.arrow}</a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFESTO — the cream inversion ────────────────────────────────────
          The page ran #1C1208 → #141010 → #2A1F12 top to bottom: three values
          inside one dark, never touching the cream half of the brand. Editorial
          design punctuates with value, and this is the section that earns it —
          the moral centre, set on paper so it reads as a printed statement
          rather than another card in a stack of five. Full-bleed on purpose: the
          inversion only works if the ground genuinely changes. */}
      <section className="av-grain av-grain--paper" style={{ background: T.paper, color: T.ink, padding: `${PAD.wide} 20px`, marginBottom: PAD.normal }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <Eyebrow tone="ethics" onPaper>The part most people leave out</Eyebrow>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5.6vw, 60px)', lineHeight: 1.08, letterSpacing: '-0.02em', color: T.ink, margin: `0 0 ${SP.xl}px`, maxWidth: 720 }}>
              Here is what I will not do.
            </h2>
            <div style={{ display: 'grid', gap: SP.lg, maxWidth: 760 }}>
              {MANIFESTO.map((p, i) => (
                <p key={i} style={{
                  /* One pull-quote, set in italic serif at reading size. The
                     third line is the load-bearing claim of the whole page. */
                  fontFamily: i === 2 ? SERIF : undefined,
                  fontStyle: i === 2 ? 'italic' : undefined,
                  fontSize: i === 2 ? 'clamp(20px, 2.6vw, 26px)' : FS.base,
                  lineHeight: i === 2 ? 1.5 : 1.72,
                  color: i === 2 ? T.ink : T.inkMuted,
                  margin: 0,
                  paddingLeft: SP.lg,
                  borderLeft: `2px solid ${i === 2 ? T.rouge : 'rgba(20,16,16,.14)'}`,
                }}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: `0 20px ${PAD.normal}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 5.4vw, 48px)', lineHeight: 1.1, color: T.paper, margin: `0 0 ${SP.xl}px` }}>Questions people actually ask</h2>
          </Reveal>
          <div style={{ display: 'grid', gap: 12 }}>
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{
                  background: open ? T.surface : 'rgba(42,31,18,.5)',
                  boxShadow: open
                    ? `inset 0 0 0 1px rgba(217,79,61,.36), 0 16px 40px rgba(0,0,0,.24)`
                    : `inset 0 1px 0 rgba(255,255,255,.06)`,
                  borderRadius: RA.sm + 4, overflow: 'hidden', transition: 'box-shadow .2s ease, background-color .2s ease',
                }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left', background: 'transparent', border: 'none', color: T.paper, padding: '20px 22px', fontSize: FS.base, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}
                  >
                    {f.q}
                    <span aria-hidden style={{ color: T.rouge, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s ease', fontSize: 24, lineHeight: 1 }}>+</span>
                  </button>
                  {open && (
                    <p style={{ margin: 0, padding: '0 22px 22px', fontSize: FS.sm, lineHeight: 1.7, color: T.muted }}>{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FORM ───────────────────────────────────────────────────────────── */}
      <section id="start" style={{ padding: `0 20px ${PAD.wide}`, scrollMarginTop: 20 }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div className="av-grain" style={{ background: `linear-gradient(170deg, rgba(217,79,61,.16), rgba(28,18,8,0) 46%), ${T.surface}`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.09), 0 34px 80px rgba(0,0,0,.34)`, borderRadius: RA.lg, padding: 'clamp(28px, 5vw, 46px)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ color: T.sage, marginBottom: SP.md, display: 'flex', justifyContent: 'center' }}>{Icon.check}</div>
                <h2 style={{ fontFamily: SERIF, fontSize: FS.lg + 4, color: T.paper, margin: `0 0 ${SP.sm}px` }}>Got it.</h2>
                <p style={{ fontSize: FS.base, lineHeight: 1.65, color: T.muted, margin: `0 0 ${SP.lg}px` }}>I&rsquo;ll message you personally, usually within a few hours, during working hours ({client.hours}).</p>
                <a href={wa} onClick={onWa} target="_blank" rel="noopener noreferrer" className="av-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 44, background: 'transparent', boxShadow: `inset 0 0 0 1px rgba(240,233,223,.24)`, color: T.dust, textDecoration: 'none', padding: '14px 24px', borderRadius: RA.pill, fontWeight: 500, cursor: 'pointer' }}>{Icon.whatsapp} Or message me now</a>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4.4vw, 40px)', lineHeight: 1.14, color: T.paper, margin: `0 0 ${SP.sm}px` }}>Tell me what you do.</h2>
                <p style={{ fontSize: FS.base, lineHeight: 1.62, color: T.muted, margin: `0 0 ${SP.lg}px` }}>Thirty minutes, free, no pitch deck. If it isn&rsquo;t a fit I&rsquo;ll say so on the call.</p>
                {/* Only name and number are required now. Five mandatory fields on
                    a cold page is a tax on every visitor, and the budget select
                    in particular was asking someone to disqualify themselves
                    before they were sold. The qualifying questions stay on the
                    form — marked optional — rather than blocking the send. */}
                <form onSubmit={submit} style={{ display: 'grid', gap: SP.md }} noValidate>
                  <Field label="Your name" htmlFor="f-name">
                    <input id="f-name" className="av-in" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair" style={inputStyle} />
                  </Field>
                  <Field label="WhatsApp number" htmlFor="f-phone">
                    <input id="f-phone" className="av-in" required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" style={inputStyle} />
                  </Field>
                  <Field label="What do you do?" htmlFor="f-work" optional>
                    <input id="f-work" className="av-in" value={work} onChange={(e) => setWork(e.target.value)} placeholder="e.g. career coach for mid-career switchers" style={inputStyle} />
                  </Field>
                  <Field label="What's stopped you posting video so far?" htmlFor="f-blocker" optional>
                    <textarea id="f-blocker" className="av-in" rows={3} value={blocker} onChange={(e) => setBlocker(e.target.value)} placeholder="Be honest, this is the useful bit" style={{ ...inputStyle, resize: 'vertical' }} />
                  </Field>
                  <Field label="Budget comfort" htmlFor="f-budget" optional>
                    <select id="f-budget" className="av-select" value={budget} onChange={(e) => setBudget(e.target.value)} style={inputStyle}>
                      <option value="">Choose one</option>
                      <option value="lt10">Under ₹10,000 a month</option>
                      <option value="10-20">₹10,000 – ₹20,000 a month</option>
                      <option value="20plus">₹20,000+ a month</option>
                    </select>
                  </Field>

                  {err && <p role="alert" style={{ color: T.rougeLit, fontSize: FS.sm, margin: 0 }}>{err}</p>}

                  <button type="submit" disabled={sending} className="av-btn" style={{ minHeight: 52, background: sending ? T.dim : T.rouge, color: T.paper, border: 'none', borderRadius: RA.pill, padding: '16px 28px', fontSize: FS.base, fontWeight: 600, fontFamily: 'inherit', cursor: sending ? 'wait' : 'pointer', marginTop: 4, boxShadow: sending ? 'none' : 'inset 0 1px 0 rgba(255,255,255,.18), 0 16px 40px rgba(217,79,61,.26)' }}>
                    {sending ? 'Sending…' : client.primaryCTA}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ boxShadow: `inset 0 1px 0 rgba(240,233,223,.09)`, padding: '34px 20px 40px', textAlign: 'center' }}>
        <p style={{ fontFamily: SERIF, fontSize: FS.lg - 4, color: T.paper, margin: `0 0 ${SP.xs}px` }}>
          ume<span style={{ color: T.rouge }}>vio</span>
        </p>
        <p style={{ fontSize: FS.sm, color: T.dim, margin: '0 0 6px' }}>{client.founder.name} · {client.address}</p>
        <p style={{ fontSize: FS.sm, color: T.dim, margin: 0 }}>{client.instagram} · {client.website}</p>
      </footer>

      {/* Clears the fixed mobile bar. This used to be baked into the footer's
          108px bottom padding, which left a dead band on desktop where the bar
          is not shown at all. */}
      <div className="av-tailpad" aria-hidden />

      {/* ── PLAYER ─────────────────────────────────────────────────────────── */}
      {playing && (
        <div
          role="dialog" aria-modal="true" aria-label={`${playing.c} — ${playing.t}`}
          onClick={() => setPlaying(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,7,4,.92)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} className="player-box" style={{ width: '100%' }}>
            <video
              src={playing.v} controls autoPlay playsInline
              style={{ width: '100%', display: 'block', borderRadius: RA.sm + 4, background: T.ink, boxShadow: `inset 0 0 0 1px rgba(240,233,223,.14)` }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 14 }}>
              <p style={{ margin: 0, fontSize: FS.sm, color: T.muted }}>
                <span style={{ color: T.turmeric }}>{playing.c}</span> · {playing.t}
              </p>
              <button onClick={() => setPlaying(null)} className="av-btn" style={{ minHeight: 44, minWidth: 44, padding: '10px 18px', borderRadius: RA.pill, background: 'transparent', boxShadow: `inset 0 0 0 1px rgba(240,233,223,.24)`, border: 'none', color: T.dust, fontSize: FS.sm, fontFamily: 'inherit', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING WHATSAPP (desktop) ────────────────────────────────────── */}
      <a
        href={wa}
        onClick={onWa}
        target="_blank"
        rel="noopener noreferrer"
        className="av-fab"
        aria-label={`${client.secondaryCTA} — opens WhatsApp in a new tab`}
      >
        {Icon.whatsapp}
        <span className="av-fab-label">{client.secondaryCTA}</span>
      </a>

      {/* ── STICKY BAR (mobile only) ───────────────────────────────────────── */}
      <div className="av-sticky">
        <a href={`tel:${client.phone}`} onClick={onCall} className="av-btn" style={{ flex: 1, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', boxShadow: `inset 0 0 0 1px rgba(240,233,223,.24)`, color: T.dust, textDecoration: 'none', borderRadius: RA.pill, fontWeight: 600, fontSize: FS.sm, cursor: 'pointer' }}>Call</a>
        <a href={wa} onClick={onWa} target="_blank" rel="noopener noreferrer" className="av-btn" style={{ flex: 2, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: T.rouge, color: T.paper, textDecoration: 'none', borderRadius: RA.pill, fontWeight: 600, fontSize: FS.sm, cursor: 'pointer' }}>{Icon.whatsapp} {client.secondaryCTA}</a>
      </div>
    </main>
  );
}

const inputStyle: CSSProperties = {
  width: '100%', minHeight: 48, background: 'rgba(20,16,16,.6)',
  border: 'none', boxShadow: 'inset 0 0 0 1px rgba(240,233,223,.16)',
  borderRadius: RA.sm, padding: '14px 16px', color: T.dust, fontSize: 16, fontFamily: 'inherit', outline: 'none',
};

function Field({ label, htmlFor, optional = false, children }: { label: string; htmlFor: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: FS.xs, letterSpacing: '.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 8 }}>
        {label}
        {optional && <span style={{ letterSpacing: '.06em', color: T.dim, textTransform: 'none' }}>optional</span>}
      </label>
      {children}
    </div>
  );
}

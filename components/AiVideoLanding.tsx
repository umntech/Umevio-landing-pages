'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { client } from '@/lib/client.config';

/**
 * AiVideoLanding — the /ai-video page, built from scratch on the REAL umevio.com
 * design system (warm-dark ground, rouge accent, DM Serif + Outfit), NOT on the
 * inherited Proalign template.
 *
 * Tokens are taken verbatim from the live site's :root — warm-dark #1C1208,
 * ink #141010, surface #2A1F12 / #332618, rouge #D94F3D, turmeric #E8A838,
 * sage #5C7A5F, dust #F0E9DF, muted #A89880, dim #6B5A47.
 *
 * GUARDRAIL: not one invented number on this page. Every figure is a price, a
 * duration or a capacity — all true, all verifiable.
 */

/* ── Where the video lives ────────────────────────────────────────────────
   The site is on Vercel; the video is on Cloudflare R2. Set
   NEXT_PUBLIC_VIDEO_BASE to the R2 public base URL (no trailing slash) and every
   path below follows it. Unset, it falls back to /videos so local development
   works from public/videos — which is gitignored, so 346 MB of video never
   enters the repo. Filenames are flat and unique, so the bucket is a flat
   drop of the same files. */
const V = process.env.NEXT_PUBLIC_VIDEO_BASE || '/videos';

/* ── Brand tokens (from umevio.com :root) ─────────────────────────────────── */
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
  dim: '#6B5A47',
};

/* ── Reveal on scroll — one or two elements per view, never everything ────── */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

const TIERS = [
  { name: 'Try one', price: '₹5,000', note: 'a single finished video', bullets: ['One reel, start to finish', 'Script written for you', 'No commitment'], hot: false },
  { name: 'Content engine', price: '₹17,500', note: 'per month · 4 finished reels', bullets: ['One reel every week', 'Avatar + voice setup free', 'First month ₹14,875', 'You approve every script', 'No lock-in, cancel any month'], hot: true },
  { name: 'Double volume', price: '₹30,000', note: 'per month · 8 finished reels', bullets: ['Two reels every week', 'Everything in the engine', 'First month ₹25,500'], hot: false },
];

const FAQS = [
  { q: 'Will my audience feel tricked?', a: 'They should not, because nothing is hidden. The video is labelled as AI, the words are yours, and you approve every script before it exists. Where a platform asks for an AI label, it gets one. The people who get into trouble here are the ones pretending, and that is a choice they made, not something the format did to them.' },
  { q: "Can't I just do this myself with the software?", a: 'In principle, yes, the tools are available to anyone. But the software is the easy part. What you would still be doing every single week is choosing the topic, researching it, writing a script that sounds like you, generating, cutting, captioning, scoring and actually shipping it. That is the work, and that is what I sell. If you have those hours free and enjoy that craft, do it yourself. I mean that.' },
  { q: 'How much of my time does this actually take?', a: 'One fifteen-minute recording at the start. After that: send a topic, reply "ok" to a script. That is the whole ongoing commitment.' },
  { q: 'Are you an agency?', a: 'No. One person, me. I run the ads, write the scripts and edit the videos myself. No account managers, nothing handed to a junior. That is also why the client count is capped.' },
  { q: 'What if I hate the result?', a: 'Buy one video for ₹5,000 and find out before committing to anything monthly. There is no setup fee and no lock-in on the monthly plan either. If it stops working, stop, and I hand your recording back.' },
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

const MANIFESTO = [
  'Umevio uses AI replicas — with the written consent of the person cloned, script approval before anything renders, and platform AI labels wherever a viewer could mistake a replica for a live recording.',
  'We never build synthetic customers, fake testimonials, or anyone’s likeness without their personal consent. If that is what a project needs, we are the wrong studio.',
  'The system I build these in will not render a made-up number. It is a check that runs before anything ships, and a video that breaks it does not go out.',
  'I take six video clients at most. That is arithmetic rather than a sales tactic. This runs alongside other work, and six is the point where the quality would start to slip.',
];

/* ── Page ─────────────────────────────────────────────────────────────────── */

const CSS = `
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1); }
        .reveal[data-shown="true"] { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1 !important; transform: none !important; transition: none !important; } }
        .av-grid { background-image: linear-gradient(rgba(240,233,223,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(240,233,223,.045) 1px, transparent 1px); background-size: 64px 64px; }
        .av-btn { transition: background-color .2s ease, color .2s ease, border-color .2s ease, box-shadow .2s ease; }
        .av-card { transition: border-color .2s ease, background-color .2s ease; }
        a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, summary:focus-visible {
          outline: 2px solid ${T.turmeric}; outline-offset: 3px; border-radius: 6px;
        }
        .av-in::placeholder { color: ${T.dim}; }

        /* ── The work wall ── two rows, opposite directions, paused on hover ── */
        .mq { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%); mask-image: linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%); }
        .mq-track { display: flex; gap: 14px; width: max-content; padding: 2px 14px; animation: mq-f 52s linear infinite; }
        .mq-track[data-dir="rev"] { animation-name: mq-r; animation-duration: 58s; }
        .mq:hover .mq-track, .mq:focus-within .mq-track { animation-play-state: paused; }
        @keyframes mq-f { from { transform: translateX(0); }        to { transform: translateX(-50%); } }
        @keyframes mq-r { from { transform: translateX(-50%); }     to { transform: translateX(0); } }
        @media (prefers-reduced-motion: reduce) {
          .mq { overflow-x: auto; }
          .mq-track { animation: none; }
        }
        .mq-tile { position: relative; flex: 0 0 auto; width: 166px; border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(240,233,223,.12); background: ${T.ink}; padding: 0; display: block; cursor: pointer;
          transition: border-color .2s ease, transform .2s ease; }
        .mq-tile:hover { border-color: rgba(217,79,61,.62); }
        .mq-tile img { width: 100%; height: 295px; object-fit: cover; display: block; }
        .mq-play { position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 999px;
          display: grid; place-items: center; background: rgba(217,79,61,.92); color: ${T.paper}; }
        .mq-meta { position: absolute; left: 0; right: 0; bottom: 0; padding: 44px 12px 11px; text-align: left;
          background: linear-gradient(180deg, rgba(20,16,16,0) 0%, rgba(20,16,16,.78) 38%, rgba(20,16,16,.97) 72%); }
        @media (min-width: 768px) {
          .mq-tile { width: 198px; }
          .mq-tile img { height: 352px; }
        }

        /* ── Two-column on desktop ──
           A 9:16 video in a full-width column leaves a huge void beside it on a
           laptop. These two sections put the copy next to the video instead. */
        .split { display: grid; gap: 30px; }
        .split-media { justify-self: start; width: 100%; max-width: 356px; }
        @media (min-width: 920px) {
          .split { grid-template-columns: 1.05fr 0.95fr; gap: 60px; align-items: center; }
          .split-media { justify-self: end; margin-top: 0 !important; max-width: 400px; }
          .split-copy { max-width: 560px; }
        }
        /* The player: big enough that a 1080 source is actually seen, capped by
           viewport height so a 9:16 clip never overflows the screen. */
        /* ── Hero cover ── a still of the 1080 master + a play affordance ── */
        .hero-cover { position: relative; display: block; width: 100%; padding: 0; border: none;
          background: ${T.ink}; border-radius: 19px; overflow: hidden; cursor: pointer; }
        .hero-cover img { width: 100%; height: auto; display: block; }
        .hc-scrim { position: absolute; inset: 0; background:
          linear-gradient(180deg, rgba(20,16,16,.55) 0%, rgba(20,16,16,0) 30%, rgba(20,16,16,0) 52%, rgba(20,16,16,.86) 100%); }
        .hc-tag { position: absolute; top: 14px; left: 14px; display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 13px; border-radius: 999px; background: rgba(20,16,16,.72); border: 1px solid rgba(217,79,61,.5);
          color: ${T.dust}; font-size: 11px; letter-spacing: .16em; font-weight: 600; backdrop-filter: blur(6px); }
        .hc-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 76px; height: 76px; border-radius: 999px; display: grid; place-items: center;
          background: ${T.rouge}; color: ${T.paper}; padding-left: 5px;
          box-shadow: 0 0 0 10px rgba(217,79,61,.16), 0 0 0 22px rgba(217,79,61,.07), 0 16px 44px rgba(0,0,0,.5);
          transition: transform .2s ease, box-shadow .2s ease; }
        .hero-cover:hover .hc-play { transform: translate(-50%,-50%) scale(1.06);
          box-shadow: 0 0 0 12px rgba(217,79,61,.22), 0 0 0 26px rgba(217,79,61,.09), 0 16px 44px rgba(0,0,0,.5); }
        .hc-foot { position: absolute; left: 16px; right: 16px; bottom: 15px; display: flex; align-items: flex-end;
          justify-content: space-between; gap: 12px; text-align: left; }
        .hc-line { color: ${T.paper}; font-size: 15px; line-height: 1.35; font-weight: 500; max-width: 230px;
          text-shadow: 0 2px 14px rgba(0,0,0,.8); }
        .hc-dur { color: ${T.dust}; font-size: 12px; letter-spacing: .08em; padding: 5px 10px; border-radius: 999px;
          background: rgba(20,16,16,.7); border: 1px solid rgba(240,233,223,.18); flex-shrink: 0; }
        .player-box { max-width: min(400px, calc((100vh - 150px) * 0.5625)); }
        @media (min-width: 768px) { .player-box { max-width: min(480px, calc((100vh - 160px) * 0.5625)); } }
      `;

export default function AiVideoLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [playing, setPlaying] = useState<(typeof LIBRARY)[number] | null>(null);
  const [heroOn, setHeroOn] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [work, setWork] = useState('');
  const [blocker, setBlocker] = useState('');
  const [budget, setBudget] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const wa = `https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hi Sreevin — I saw the AI video page and I'd like to know more.")}`;

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
      if (typeof window !== 'undefined') {
        const w = window as unknown as { fbq?: (...a: unknown[]) => void; dataLayer?: unknown[] };
        w.fbq?.('track', 'Lead');
        w.dataLayer?.push({ event: 'generate_lead', form: 'ai-video' });
      }
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
      <section className="av-grid" style={{ position: 'relative', padding: 'clamp(48px, 7vw, 68px) 20px clamp(52px, 7vw, 72px)' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(72% 46% at 50% 0%, rgba(217,79,61,.20) 0%, rgba(28,18,8,0) 68%)`, pointerEvents: 'none' }} />
        <div className="split" style={{ position: 'relative', maxWidth: 1120, margin: '0 auto' }}>

          <div className="split-copy">
          <Reveal>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: `1px solid rgba(217,79,61,.35)`, background: 'rgba(217,79,61,.09)', color: T.rougeLit, borderRadius: 999, padding: '8px 16px', fontSize: 12.5, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: T.rouge, display: 'inline-block' }} />
              AI Video Content Engine
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h1 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(44px, 9vw, 82px)', lineHeight: 1.02, letterSpacing: '-0.02em', margin: '26px 0 0', color: T.paper, maxWidth: 900 }}>
              Record once.<br />Post <span style={{ color: T.rouge }}>every day</span>.
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p style={{ fontSize: 'clamp(17px, 2.2vw, 21px)', lineHeight: 1.62, color: T.muted, margin: '24px 0 0', maxWidth: 620 }}>
              AI video for coaches and founders who can&rsquo;t keep filming. You sit down once for fifteen minutes. After that I write the scripts and make the videos for the rest of the month, you okay every one before it goes out, and they all say they&rsquo;re AI.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: '34px 0 0' }}>
              <a href="#start" className="av-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: T.rouge, color: T.paper, textDecoration: 'none', padding: '17px 30px', borderRadius: 999, fontWeight: 600, fontSize: 16.5, minHeight: 44, boxShadow: '0 0 0 1px rgba(217,79,61,.5), 0 18px 46px rgba(217,79,61,.28)', cursor: 'pointer' }}>
                {client.primaryCTA} {Icon.arrow}
              </a>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="av-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', color: T.dust, textDecoration: 'none', padding: '17px 26px', borderRadius: 999, fontWeight: 500, fontSize: 16.5, minHeight: 44, border: `1px solid rgba(240,233,223,.22)`, cursor: 'pointer' }}>
                {Icon.whatsapp} WhatsApp
              </a>
            </div>
          </Reveal>

          </div>

          {/* Hero video */}
          <Reveal delay={240}>
            <figure className="split-media" style={{ margin: '38px 0 0' }}>
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
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: T.rouge, display: 'inline-block' }} />
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
              <figcaption style={{ marginTop: 14, fontSize: 12.5, letterSpacing: '.14em', textTransform: 'uppercase', color: T.dim }}>
This video is AI, made from one 15-minute recording
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── STRIP ──────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid rgba(240,233,223,.09)`, borderBottom: `1px solid rgba(240,233,223,.09)`, background: 'rgba(20,16,16,.45)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px 26px', justifyContent: 'center', fontSize: 13.5, letterSpacing: '.1em', textTransform: 'uppercase', color: T.dim }}>
          {['One recording', 'Multiple looks', 'Scripts written for you', 'Fully edited', 'You approve everything'].map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden style={{ width: 5, height: 5, borderRadius: 999, background: T.rouge }} />{s}
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ────────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(58px, 8vw, 84px) 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <p style={{ fontSize: 12.5, letterSpacing: '.18em', textTransform: 'uppercase', color: T.rouge, marginBottom: 16 }}>Why it never happens</p>
            <h2 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(32px, 5.4vw, 52px)', lineHeight: 1.1, letterSpacing: '-0.015em', color: T.paper, maxWidth: 720, margin: 0 }}>
              You already know video works. That was never the problem.
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: 34 }}>
            {PROBLEMS.map((p, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="av-card" style={{ height: '100%', background: `linear-gradient(180deg, ${T.surface} 0%, ${T.ink} 100%)`, border: `1px solid rgba(240,233,223,.10)`, borderRadius: 22, padding: '28px 24px' }}>
                  <div style={{ color: T.rouge, marginBottom: 16 }}>{p.icon}</div>
                  <h3 style={{ fontSize: 19, fontWeight: 600, color: T.paper, margin: '0 0 10px' }}>{p.title}</h3>
                  <p style={{ fontSize: 15.5, lineHeight: 1.65, color: T.muted, margin: 0 }}>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROOF ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 20px clamp(58px, 8vw, 84px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="split" style={{ background: `linear-gradient(150deg, rgba(217,79,61,.14), rgba(28,18,8,0) 55%), ${T.ink}`, border: `1px solid rgba(240,233,223,.10)`, borderRadius: 30, padding: 'clamp(28px, 5vw, 56px)' }}>
            <div className="split-copy">
            <Reveal>
              <p style={{ fontSize: 12.5, letterSpacing: '.18em', textTransform: 'uppercase', color: T.turmeric, marginBottom: 16 }}>Don&rsquo;t take my word for it</p>
              <h2 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.12, color: T.paper, margin: '0 0 18px', maxWidth: 620 }}>
                &ldquo;But AI videos look fake.&rdquo;
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: T.muted, maxWidth: 560, margin: 0 }}>
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
                style={{ display: 'block', borderRadius: 20, background: T.ink, border: `1px solid rgba(240,233,223,.12)` }}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── THE WALL — two auto-scrolling rows of real delivered work ──────── */}
      <section style={{ padding: '0 0 clamp(58px, 8vw, 88px)' }} aria-labelledby="wall-h">
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 20px' }}>
          <Reveal>
            <p style={{ fontSize: 12.5, letterSpacing: '.18em', textTransform: 'uppercase', color: T.turmeric, marginBottom: 14 }}>The output</p>
            <h2 id="wall-h" style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(30px, 5vw, 48px)', lineHeight: 1.1, color: T.paper, margin: '0 0 12px', maxWidth: 640 }}>
              This is what a month looks like.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: T.muted, margin: '0 0 30px', maxWidth: 540 }}>
              All of this is real client work. Tap any one to watch it. Every video here came out of a single recording session with that person.
            </p>
          </Reveal>
        </div>

        {[0, 1].map((row) => (
          <div key={row} className="mq" style={{ marginBottom: row === 0 ? 14 : 0 }}>
            <div className="mq-track" data-dir={row === 1 ? 'rev' : 'fwd'}>
              {[...LIBRARY.slice(row * 7, row * 7 + 7), ...LIBRARY.slice(row * 7, row * 7 + 7)].map((item, i) => (
                <button
                  key={`${item.s}-${i}`}
                  onClick={() => setPlaying(item)}
                  aria-label={`Play: ${item.c} — ${item.t}`}
                  className="mq-tile"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.p} alt="" width={360} height={640} loading="lazy" decoding="async" />
                  <span className="mq-play" aria-hidden>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <span className="mq-meta">
                    <span style={{ color: T.turmeric, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', display: 'block' }}>{item.c}</span>
                    <span style={{ color: T.paper, fontSize: 13.5, lineHeight: 1.3, display: 'block', marginTop: 2 }}>{item.t}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── HOW ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 20px clamp(58px, 8vw, 88px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <p style={{ fontSize: 12.5, letterSpacing: '.18em', textTransform: 'uppercase', color: T.rouge, marginBottom: 16 }}>How it works</p>
            <h2 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(32px, 5.4vw, 52px)', lineHeight: 1.1, color: T.paper, margin: '0 0 34px', maxWidth: 640 }}>
              Fifteen minutes of your time. Once.
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 90}>
                <div style={{ position: 'relative', paddingTop: 30 }}>
                  <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${T.rouge}, rgba(217,79,61,0))` }} />
                  <span style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 44, color: 'rgba(240,233,223,.16)', lineHeight: 1 }}>{s.n}</span>
                  <h3 style={{ fontSize: 22, fontWeight: 600, color: T.paper, margin: '14px 0 10px' }}>{s.t}</h3>
                  <p style={{ fontSize: 15.5, lineHeight: 1.68, color: T.muted, margin: 0 }}>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 20px clamp(58px, 8vw, 88px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <Reveal>
            <p style={{ fontSize: 12.5, letterSpacing: '.18em', textTransform: 'uppercase', color: T.rouge, marginBottom: 16 }}>What it costs</p>
            <h2 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(32px, 5.4vw, 52px)', lineHeight: 1.1, color: T.paper, margin: '0 0 12px' }}>
              No setup fee. No lock-in.
            </h2>
            <p style={{ fontSize: 16.5, color: T.muted, margin: '0 0 32px', maxWidth: 560 }}>Billed monthly in advance. Cancel any month and I hand your recording back.</p>
          </Reveal>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', alignItems: 'stretch' }}>
            {TIERS.map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <div style={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  background: t.hot ? `linear-gradient(180deg, rgba(217,79,61,.16), ${T.ink} 58%)` : `linear-gradient(180deg, ${T.surface} 0%, ${T.ink} 100%)`,
                  border: `1px solid ${t.hot ? 'rgba(217,79,61,.55)' : 'rgba(240,233,223,.10)'}`,
                  borderRadius: 26, padding: '32px 26px',
                  boxShadow: t.hot ? '0 24px 60px rgba(217,79,61,.16)' : 'none',
                }}>
                  {t.hot && (
                    <span style={{ alignSelf: 'flex-start', fontSize: 11.5, letterSpacing: '.16em', textTransform: 'uppercase', color: T.ink, background: T.turmeric, borderRadius: 999, padding: '6px 13px', fontWeight: 700, marginBottom: 18 }}>Most take this</span>
                  )}
                  <p style={{ fontSize: 12.5, letterSpacing: '.16em', textTransform: 'uppercase', color: T.muted, margin: '0 0 12px' }}>{t.name}</p>
                  <p style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 46, lineHeight: 1, color: T.paper, margin: 0 }}>{t.price}</p>
                  <p style={{ fontSize: 14.5, color: T.dim, margin: '8px 0 22px' }}>{t.note}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'grid', gap: 11, flex: 1 }}>
                    {t.bullets.map((b, j) => (
                      <li key={j} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 15.5, lineHeight: 1.5, color: T.dust }}>
                        <span style={{ color: t.hot ? T.turmeric : T.sage, flexShrink: 0, marginTop: 3 }}>{Icon.check}</span>{b}
                      </li>
                    ))}
                  </ul>
                  <a href="#start" className="av-btn" style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 44,
                    background: t.hot ? T.rouge : 'transparent', color: t.hot ? T.paper : T.dust,
                    border: t.hot ? 'none' : `1px solid rgba(240,233,223,.24)`,
                    textDecoration: 'none', padding: '14px 22px', borderRadius: 999, fontWeight: 600, fontSize: 15.5, cursor: 'pointer',
                  }}>Start here {Icon.arrow}</a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 20px clamp(58px, 8vw, 88px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="av-grid" style={{ position: 'relative', border: `1px solid rgba(240,233,223,.12)`, borderRadius: 30, padding: 'clamp(30px, 5vw, 62px)', background: `radial-gradient(80% 60% at 12% 0%, rgba(92,122,95,.16), rgba(20,16,16,0) 62%), ${T.ink}`, overflow: 'hidden' }}>
            <Reveal>
              <p style={{ fontSize: 12.5, letterSpacing: '.18em', textTransform: 'uppercase', color: T.sage, marginBottom: 18 }}>The part most people leave out</p>
              <h2 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(28px, 4.6vw, 44px)', lineHeight: 1.16, color: T.paper, margin: '0 0 30px', maxWidth: 720 }}>
                Here is what I will not do.
              </h2>
              <div style={{ display: 'grid', gap: 18, maxWidth: 760 }}>
                {MANIFESTO.map((p, i) => (
                  <p key={i} style={{ fontSize: 16.5, lineHeight: 1.72, color: i === 2 ? T.dust : T.muted, margin: 0, paddingLeft: 20, borderLeft: `2px solid ${i === 2 ? T.rouge : 'rgba(240,233,223,.14)'}` }}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 20px clamp(58px, 8vw, 88px)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(32px, 5.4vw, 48px)', lineHeight: 1.1, color: T.paper, margin: '0 0 28px' }}>Questions people actually ask</h2>
          </Reveal>
          <div style={{ display: 'grid', gap: 12 }}>
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{ background: open ? T.surface : 'rgba(42,31,18,.5)', border: `1px solid ${open ? 'rgba(217,79,61,.36)' : 'rgba(240,233,223,.10)'}`, borderRadius: 18, overflow: 'hidden', transition: 'border-color .2s ease, background-color .2s ease' }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    style={{ width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left', background: 'transparent', border: 'none', color: T.paper, padding: '20px 22px', fontSize: 16.5, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' }}
                  >
                    {f.q}
                    <span aria-hidden style={{ color: T.rouge, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s ease', fontSize: 24, lineHeight: 1 }}>+</span>
                  </button>
                  {open && (
                    <p style={{ margin: 0, padding: '0 22px 22px', fontSize: 15.5, lineHeight: 1.7, color: T.muted }}>{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FORM ───────────────────────────────────────────────────────────── */}
      <section id="start" style={{ padding: '0 20px clamp(68px, 9vw, 100px)', scrollMarginTop: 20 }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <div style={{ background: `linear-gradient(170deg, rgba(217,79,61,.16), rgba(28,18,8,0) 46%), ${T.surface}`, border: `1px solid rgba(240,233,223,.14)`, borderRadius: 30, padding: 'clamp(28px, 5vw, 46px)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ color: T.sage, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{Icon.check}</div>
                <h2 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 32, color: T.paper, margin: '0 0 12px' }}>Got it.</h2>
                <p style={{ fontSize: 16.5, lineHeight: 1.65, color: T.muted, margin: '0 0 24px' }}>I&rsquo;ll message you personally, usually within a few hours, during working hours ({client.hours}).</p>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="av-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 44, background: 'transparent', border: `1px solid rgba(240,233,223,.24)`, color: T.dust, textDecoration: 'none', padding: '14px 24px', borderRadius: 999, fontWeight: 500, cursor: 'pointer' }}>{Icon.whatsapp} Or message me now</a>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 'clamp(28px, 4.4vw, 40px)', lineHeight: 1.14, color: T.paper, margin: '0 0 12px' }}>Tell me what you do.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.62, color: T.muted, margin: '0 0 28px' }}>Thirty minutes, free, no pitch deck. If it isn&rsquo;t a fit I&rsquo;ll say so on the call.</p>
                <form onSubmit={submit} style={{ display: 'grid', gap: 16 }} noValidate>
                  <Field label="Your name" htmlFor="f-name">
                    <input id="f-name" className="av-in" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair" style={inputStyle} />
                  </Field>
                  <Field label="WhatsApp number" htmlFor="f-phone">
                    <input id="f-phone" className="av-in" required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" style={inputStyle} />
                  </Field>
                  <Field label="What do you do?" htmlFor="f-work">
                    <input id="f-work" className="av-in" value={work} onChange={(e) => setWork(e.target.value)} placeholder="e.g. career coach for mid-career switchers" style={inputStyle} />
                  </Field>
                  <Field label="What's stopped you posting video so far?" htmlFor="f-blocker">
                    <textarea id="f-blocker" className="av-in" rows={3} value={blocker} onChange={(e) => setBlocker(e.target.value)} placeholder="Be honest, this is the useful bit" style={{ ...inputStyle, resize: 'vertical' }} />
                  </Field>
                  <Field label="Budget comfort" htmlFor="f-budget">
                    <select id="f-budget" required value={budget} onChange={(e) => setBudget(e.target.value)} style={inputStyle}>
                      <option value="">Choose one</option>
                      <option value="lt10">Under ₹10,000 a month</option>
                      <option value="10-20">₹10,000 – ₹20,000 a month</option>
                      <option value="20plus">₹20,000+ a month</option>
                    </select>
                  </Field>

                  {err && <p role="alert" style={{ color: T.rougeLit, fontSize: 14.5, margin: 0 }}>{err}</p>}

                  <button type="submit" disabled={sending} className="av-btn" style={{ minHeight: 52, background: sending ? T.dim : T.rouge, color: T.paper, border: 'none', borderRadius: 999, padding: '16px 28px', fontSize: 16.5, fontWeight: 600, fontFamily: 'inherit', cursor: sending ? 'wait' : 'pointer', marginTop: 4, boxShadow: sending ? 'none' : '0 16px 40px rgba(217,79,61,.26)' }}>
                    {sending ? 'Sending…' : client.primaryCTA}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid rgba(240,233,223,.09)`, padding: '34px 20px 108px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dmserif), Georgia, serif', fontSize: 24, color: T.paper, margin: '0 0 8px' }}>
          ume<span style={{ color: T.rouge }}>vio</span>
        </p>
        <p style={{ fontSize: 14.5, color: T.dim, margin: '0 0 6px' }}>{client.founder.name} · {client.address}</p>
        <p style={{ fontSize: 14.5, color: T.dim, margin: 0 }}>{client.instagram} · {client.website}</p>
      </footer>

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
              style={{ width: '100%', display: 'block', borderRadius: 18, background: T.ink, border: `1px solid rgba(240,233,223,.14)` }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 14 }}>
              <p style={{ margin: 0, fontSize: 14.5, color: T.muted }}>
                <span style={{ color: T.turmeric }}>{playing.c}</span> · {playing.t}
              </p>
              <button onClick={() => setPlaying(null)} className="av-btn" style={{ minHeight: 44, minWidth: 44, padding: '10px 18px', borderRadius: 999, background: 'transparent', border: `1px solid rgba(240,233,223,.24)`, color: T.dust, fontSize: 14.5, fontFamily: 'inherit', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY BAR (mobile) ────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, display: 'flex', gap: 10, padding: '12px 14px calc(12px + env(safe-area-inset-bottom))', background: 'rgba(20,16,16,.92)', backdropFilter: 'blur(12px)', borderTop: `1px solid rgba(240,233,223,.12)` }}>
        <a href={`tel:${client.phone}`} className="av-btn" style={{ flex: 1, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', border: `1px solid rgba(240,233,223,.24)`, color: T.dust, textDecoration: 'none', borderRadius: 999, fontWeight: 600, fontSize: 15.5, cursor: 'pointer' }}>Call</a>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="av-btn" style={{ flex: 2, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: T.rouge, color: T.paper, textDecoration: 'none', borderRadius: 999, fontWeight: 600, fontSize: 15.5, cursor: 'pointer' }}>{Icon.whatsapp} {client.secondaryCTA}</a>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', minHeight: 48, background: 'rgba(20,16,16,.6)', border: '1px solid rgba(240,233,223,.16)',
  borderRadius: 14, padding: '14px 16px', color: '#F0E9DF', fontSize: 16, fontFamily: 'inherit', outline: 'none',
};

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} style={{ display: 'block', fontSize: 13.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#A89880', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

/**
 * client.config.ts
 *
 * THE only file you change per client.
 * LandingPage.tsx reads everything from here — no hardcoded values allowed there.
 *
 * When starting a new client project:
 *   1. Run /setup-client (Claude Code skill) — it fills this file from your brand brief
 *   2. Everything else just works
 *
 * NOTE (Umevio): brand is dark-themed (#0B0F14 bg). The shared LandingPage component
 * was authored light-themed. Tailwind token VALUES below are remapped to Umevio brand,
 * but a true dark visual treatment is a /generate-pages design decision, not a config swap.
 */

export const client = {

  // ── Business Identity ──────────────────────────────────────────────────────
  businessName: 'Umevio',
  tagline:      'Performance marketing studio — built on honesty',
  phone:        '+918447909251',      // used for tel: links — no spaces  (TODO: confirm if call number differs from WhatsApp)
  whatsapp:     '+918447909251',      // used for wa.me/ links — no spaces
  address:      'Remote · Bangalore & Pune',
  addressFull:  'Remote-first studio · serving Bangalore & Pune',
  hours:        'Mon–Sat · 10am – 7pm',
  website:      'umevio.com',
  instagram:    '@helloumevio',

  // ── Founder / Lead Expert ──────────────────────────────────────────────────
  founder: {
    name:        'Sreevin',
    credentials: 'Founder & Performance Marketer · Meta & Google Ads · AI-accelerated creative',
    shortCreds:  'Founder · Performance Marketer',
    rating:      '',   // no public reviews yet — left blank (do not fabricate).
    reviewCount: '',   // Star/rating UI in LandingPage renders ONLY when rating is non-empty.
    photo:       '/images/hero/founder-portrait.png',
  },

  // ── Hero Section ───────────────────────────────────────────────────────────
  hero: {
    badge:       'Free 30-min strategy call — no pitch',
    image:       '/images/hero/hero-founder.jpg',
    imageAlt:    'Sreevin — founder, Umevio performance marketing studio',
    specialtyChip: {
      title:    'Founder-led',
      subtitle: 'No account managers',
    },
    pills: [
      '✦ Meta Ads',
      '✦ Google Ads',
      '✦ AI Creative',
      '✦ Landing pages',
      '✦ Founder-led',
    ],
  },

  // ── Trust Bar Stats — honest signals only, NO fabricated ROAS/CPL ───────────
  trustStats: [
    { value: '2',      label: 'Active clients' },
    { value: '100%',   label: 'Founder-led delivery' },
    { value: '3-in-1', label: 'Ads · Creative · Pages' },
    { value: 'Weekly', label: 'Founder Loom updates' },
  ],

  // ── Solution Section ───────────────────────────────────────────────────────
  solution: {
    eyebrow:   'The Umevio Difference',
    heading:   'One person.',
    headingAccent: 'Your whole funnel.',
    // Provisional AI portrait (cool-toned scene — replace with a warm-graded workspace shot per brand modifier)
    image:     '/images/hero/solution-studio.png',
    imageAlt:  'Umevio — integrated ads, creative and landing pages',
  },

  // ── How It Works Steps ─────────────────────────────────────────────────────
  steps: [
    {
      num:   '01',
      title: 'Free Strategy Call',
      desc:  'A 30-minute call — I audit your current setup and show you what\'s working, what\'s leaking budget, and what I\'d do first. No pitch deck.',
    },
    {
      num:   '02',
      title: 'The Build',
      desc:  'Campaigns restructured, landing pages built, creative briefed against real audience data. One person owns all of it.',
    },
    {
      num:   '03',
      title: 'The Tuning',
      desc:  'I read the data weekly, cut what isn\'t working, double down on what is — and send you a Loom every Monday.',
    },
    {
      num:   '04',
      title: 'Steady Growth',
      desc:  'Same budget, sharper targeting, better creative. Honest growth that compounds over time.',
    },
  ],

  // ── Founder Trust Section bullet points — honest, no invented numbers ───────
  founderPoints: [
    'Founder-led — I run your ads, creative and landing pages myself. No account managers, no junior handoffs.',
    'One integrated system: Meta & Google Ads + AI-accelerated creative + landing pages, all under one roof.',
    'Weekly Loom updates — you always know what changed, why, and what\'s next. No black box.',
    'Small by choice — I take very few clients at a time so each one gets real attention.',
  ],

  // ── Brand Colours (Umevio — OFFICIAL, from Brand Assets guide + live site) ──
  colors: {
    primary:      '#D94F3D',   // rouge/coral — headlines, CTA buttons, accents
    primaryHover: '#E2654F',   // hover states (lighter rouge)
    primaryPale:  '#F6E7E2',   // card backgrounds (warm pale rouge tint)
    primaryDark:  '#B23E2D',   // gradient end on CTA section (deep rouge)
    background:   '#FAF6F0',   // page bg (paper / warm off-white)
    dark:         '#141010',   // body text / dark sections (ink)
    darkMid:      '#2A1F12',   // secondary dark bg (warm surface)
    darkLight:    '#231610',   // tertiary dark bg
    muted:        '#A89880',   // secondary text (warm muted)
    gold:         '#E8A838',   // turmeric — premium/secondary accents
    urgency:      '#D94F3D',   // pain point icons (brand rouge doubles as urgency)
    // also available in brand: sage #5C7A5F
  },

  // ── Typography (Umevio — OFFICIAL: DM Serif Display + Outfit) ───────────────
  // Loaded in layout.tsx via next/font/google (--font-outfit / --font-dmserif).
  fonts: {
    heading: "var(--font-dmserif), 'DM Serif Display', serif",
    body:    "var(--font-outfit), 'Outfit', sans-serif",
    serif:   "var(--font-dmserif), 'DM Serif Display', serif",
  },

  // ── Tracking IDs (pulled from Umevio main site DM Umevio/index.html) ────────
  tracking: {
    gtmId:   '',                   // no GTM container yet — main site uses gtag directly
    pixelId: '1632776258010871',   // Meta Pixel ID (Umevio)
    ga4Id:   'G-R2N6FWQ5Q1',       // GA4 (Umevio)
  },

  // ── Callback form endpoint (Formspree) ──────────────────────────────────────
  // DEDICATED form for the ad pages — separate from umevio.com's contact form
  // (xjgpnglz), so ad leads get their own inbox and their own 50/month allowance
  // rather than competing with general enquiries. Every submission also carries a
  // `source` field.
  formEndpoint: 'https://formspree.io/f/xkjwzzaj',

  // ── Callback form UI ───────────────────────────────────────────────────────
  form: {
    namePlaceholder: 'e.g. Rajan Mehta',
    timeSlots: [
      { value: 'morning',   label: 'Morning (10am – 1pm)' },
      { value: 'afternoon', label: 'Afternoon (2pm – 7pm)' },
    ],
  },

  // ── CTAs ───────────────────────────────────────────────────────────────────
  primaryCTA:   'Book a Free 30-Min Call',
  secondaryCTA: 'WhatsApp Us',

  // ── Section copy (was hardcoded dental copy in LandingPage.tsx — now per-client) ──
  sectionCopy: {
    painEyebrow:        'Sound familiar?',
    painHeading:        'The reasons growth stalls — and why they\'re fixable.',
    painSub:            'You\'re not alone. These are the most common problems business owners bring to a first call.',
    stepsEyebrow:       'Simple process',
    stepsHeading:       'How it works',
    stepsSub:           'Four simple steps from first call to steady, honest growth',
    founderEyebrow:     'The Founder',
    testimonialsEyebrow:'Client stories',
    testimonialsHeading:'What clients say',
    testimonialBadge:   'CLIENT',            // shown on testimonial cards — never claim "verified" without a public review source
    formEyebrow:        'Prefer a callback?',
    formHeading:        'I\'ll call you — free, no obligation',
    formSub:            'Leave your number and I\'ll personally call you back within a few hours.',
    formPrivacyNote:    'Calls only during working hours',   // rendered with hours — no "clinic", no "team"
    successNote:        'Expect a call from me personally within a few hours.',
    finalCtaHeading:    'The 30-minute strategy call is free.',
  },

};

export type ClientConfig = typeof client;

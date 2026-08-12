'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { client } from '@/lib/client.config';

interface LandingPageProps {
  headline: string;
  subheadline: string;
  painPoints: string[];
  solutionPoints: string[];
  testimonials: { quote: string; name?: string; location?: string }[];
  faqs: { question: string; answer: string }[];
  ctaLabel?: string;
  pageVariant?: 'core' | 'cost' | 'wedding' | 'default';
  /** Override the hero section image. Falls back to client.config hero image. */
  heroImage?: string;
  /** Override the solution section image. Falls back to client.config solution image. */
  solutionImage?: string;
  /** Hide the floating Dr. Rekha trust card — use when hero image is a model, not the doctor. */
  hideDoctorCard?: boolean;
  /** Horizontal alignment of the floating trust card. Defaults to 'center'. Use 'left' or 'right' when the subject's face is centred. */
  heroCardAlign?: 'left' | 'center' | 'right';

  /* ── Optional video/offer blocks (added 2026-08-12 for /ai-video) ──────────
     Every one is optional and renders nothing when omitted, so existing pages
     are byte-for-byte unaffected. */

  /** A 9:16 demo video shown directly under the hero. Muted, looping, click for sound. */
  heroVideo?: { src: string; poster: string; label?: string };
  /** The raw-vs-finished comparison. Gets its own section — it is the objection-killer. */
  beforeAfterVideo?: { src: string; poster: string; caption?: string };
  /** Click-to-play demo tiles. Each MUST carry a label; samples are labelled samples. */
  demoVideos?: { src: string; poster: string; label: string }[];
  /** Pricing tiers. Prices come from the locked table in the growth plan §5.3 — never improvised. */
  offerTiers?: { name: string; price: string; note?: string; bullets: string[]; highlight?: boolean }[];
  /** The AI-disclosure / honesty block. Paragraphs. Do not soften — this is the differentiator. */
  honestyBlock?: { heading: string; paragraphs: string[] };
}

/* ── Respect OS reduced-motion preference ── */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/* ── Intersection observer hook for scroll animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Pain icon map — elegant SVG line icons ── */
const PAIN_ICONS = [
  <svg key="hide" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={client.colors.urgency} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  <svg key="money" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={client.colors.urgency} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9.5a2.5 2.5 0 015 0c0 1.5-1 2-2.5 2.5S9.5 13 9.5 14.5a2.5 2.5 0 005 0"/></svg>,
  <svg key="time" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={client.colors.urgency} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  <svg key="trend" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={client.colors.urgency} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  <svg key="scared" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={client.colors.urgency} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5-1 4-1 4 1 4 1"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  <svg key="question" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={client.colors.urgency} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
];

/* ── Solution step icons ── */
const STEP_ICONS = [
  <svg key="scan" width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-16h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2" stroke={client.colors.primary} strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke={client.colors.primary} strokeWidth="2"/></svg>,
  <svg key="box" width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke={client.colors.primary} strokeWidth="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={client.colors.primary} strokeWidth="2"/><line x1="12" y1="12" x2="12" y2="16" stroke={client.colors.primary} strokeWidth="2" strokeLinecap="round"/><line x1="10" y1="14" x2="14" y2="14" stroke={client.colors.primary} strokeWidth="2" strokeLinecap="round"/></svg>,
  <svg key="check" width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={client.colors.primary} strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke={client.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
];

export default function LandingPage({
  headline,
  subheadline,
  painPoints,
  solutionPoints,
  testimonials,
  faqs,
  ctaLabel = client.primaryCTA,
  pageVariant: _pageVariant = 'default',
  heroImage,
  solutionImage,
  hideDoctorCard = false,
  heroCardAlign = 'center',
  heroVideo,
  beforeAfterVideo,
  demoVideos,
  offerTiers,
  honestyBlock,
}: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = useReducedMotion();

  /* callback form state */
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhoneError, setFormPhoneError] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [testiIndex, setTestiIndex] = useState(0);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const phoneNumber  = client.phone;
  const whatsappUrl  = `https://wa.me/${client.whatsapp}`;
  const callUrl      = `tel:${phoneNumber}`;
  const c            = client.colors;

  /* fire a CAPI event server-side + push event_id to dataLayer for GTM dedup */
  function fireCapiEvent(eventName: string) {
    if (typeof window === 'undefined') return;
    const eventId = crypto.randomUUID();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer = (window as any).dataLayer || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer.push({ event_id: eventId });
    // Browser-side pixel event with the same eventID as the CAPI call below — required for Meta's dedup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq?.('track', eventName, {}, { eventID: eventId });
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_name: eventName, event_id: eventId, page_url: window.location.href }),
    }).catch(() => { /* fire-and-forget */ });
  }

  /* sticky nav shadow on scroll */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* section refs */
  const heroSection     = useInView(0.1);
  const trustSection    = useInView(0.2);
  const painSection     = useInView(0.1);
  const solutionSection = useInView(0.1);
  const stepsSection    = useInView(0.1);
  const doctorSection   = useInView(0.1);
  const testiSection    = useInView(0.1);
  const faqSection      = useInView(0.1);
  const formSection     = useInView(0.1);
  const ctaSection      = useInView(0.1);

  /* steps layout helpers */
  const stepsCompact   = client.steps.length >= 4;
  const stepsCardPad   = stepsCompact ? '24px 18px' : '36px 28px';
  const stepsIconSize  = stepsCompact ? 52 : 64;
  const stepsTitleSize = stepsCompact ? 16 : 19;
  const stepsHalfCell  = Math.round(100 / (2 * client.steps.length));

  /* testimonial slider navigation */
  function testiPrev() {
    setTestiIndex(i => (i - 1 + Math.max(1, testimonials.length)) % Math.max(1, testimonials.length));
  }
  function testiNext() {
    setTestiIndex(i => (i + 1) % Math.max(1, testimonials.length));
  }

  /* scroll all primary CTAs to the callback form */
  function scrollToForm(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById('callback-form')?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    setTimeout(() => nameInputRef.current?.focus(), reducedMotion ? 50 : 650);
  }

  function validatePhone(raw: string): string {
    const cleaned = raw.replace(/[\s\-+]/g, '');
    // Strip country code only if number is 12 digits (91 + 10 digit number)
    const digits = cleaned.length === 12 && cleaned.startsWith('91') ? cleaned.slice(2) : cleaned;
    if (!/^\d+$/.test(digits)) return 'Phone number should contain digits only';
    if (digits.length !== 10) return `Must be 10 digits (you entered ${digits.length})`;
    if (!/^[6-9]/.test(digits)) return 'Enter a valid Indian mobile number';
    return '';
  }

  /* form submission → Apps Script → Google Sheet + email */
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phoneErr = validatePhone(formPhone);
    if (phoneErr) { setFormPhoneError(phoneErr); return; }
    setFormSubmitting(true);
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).dataLayer = (window as any).dataLayer || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).dataLayer.push({ event: 'form_submission', formType: 'callback_form' });
      // GA4 direct gtag call — no GTM container exists yet, so the dataLayer push above alone doesn't reach GA4
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag?.('event', 'generate_lead', { method: 'callback_form' });
      fireCapiEvent('Lead');
    }
    if (client.formEndpoint) {
      // Fire and forget — don't await, show success immediately
      fetch(client.formEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, phone: formPhone, time: formTime, source: window.location.pathname }),
      }).catch(() => { /* no-cors — can't read response */ });
    }
    setFormSubmitting(false);
    setFormSubmitted(true);
  }

  return (
    <div style={{ fontFamily: client.fonts.body, background: c.background, minHeight: '100vh', color: c.dark, overflowX: 'hidden' }}>

      {/* ── STICKY NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.08)' : 'none',
        padding: scrolled ? '8px 24px' : '0',
      }}>
        {scrolled && (
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Image src="/images/logo.png" alt={client.businessName} width={120} height={48} style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
            <a href="#callback-form" onClick={scrollToForm} className="cta-btn nav-cta" style={{ padding: '10px 24px', fontSize: 13 }}>
              {ctaLabel} →
            </a>
          </div>
        )}
      </nav>

      {/* ── SECTION 1: HERO ── */}
      <section className="mesh-bg-cream hero-section" style={{ padding: '72px 48px 0 48px', overflow: 'hidden', position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'flex-end' }}>

        {/* Static logo top-left */}
        <div className="hero-logo" style={{ position: 'absolute', top: 20, left: 48, zIndex: 10 }}>
          <Image src="/images/logo.png" alt={client.businessName} width={100} height={40} style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Decorative background orbs */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, background: `radial-gradient(circle, ${c.primary}1F 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 100, left: -80, width: 300, height: 300, background: `radial-gradient(circle, ${c.primary}12 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />

        <div ref={heroSection.ref} className="hero-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 460px', gap: 64, alignItems: 'flex-end', width: '100%' }}>

          {/* Left: copy — always visible, hero is above fold so no JS-gated opacity */}
          <div className="hero-copy" style={{ paddingBottom: 64, opacity: 1 }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `${c.primary}1A`, color: c.primary, fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 50, marginBottom: 24, border: `1px solid ${c.primary}40`, letterSpacing: '0.02em' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: c.primary, animation: reducedMotion ? 'none' : 'pulseGlow 2s ease infinite' }} />
              {client.hero.badge}
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(36px, 4.2vw, 58px)', fontWeight: 800, lineHeight: 1.08, color: c.dark, margin: '0 0 20px', letterSpacing: '-0.025em' }}>
              {headline}
            </h1>

            {/* Subheadline */}
            <p style={{ fontSize: 17, color: '#4A5568', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 440 }}>
              {subheadline}
            </p>

            {/* CTA buttons */}
            <div className="hero-cta-row" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
              <a href="#callback-form" onClick={scrollToForm} className="cta-btn">
                {ctaLabel} →
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => fireCapiEvent('Contact')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.92)',
                color: c.dark, padding: '15px 28px', borderRadius: 50,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                transition: 'all 0.25s ease',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                WhatsApp Us
              </a>
            </div>

            {/* Pill tags */}
            <div className="hero-pills" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {client.hero.pills.map((tag, i) => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.88)',
                  border: `1px solid ${c.primary}33`, color: c.primary,
                  fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 50,
                  transition: 'all 0.2s ease',
                  animationDelay: `${i * 0.08}s`,
                }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Right: doctor photo — always visible, hero is above fold so no JS-gated opacity */}
          <div className="hero-image-col" style={{ position: 'relative', alignSelf: 'flex-end', opacity: 1 }}>

            {/* Glow behind card */}
            <div style={{ position: 'absolute', inset: -24, background: `radial-gradient(ellipse at 50% 80%, ${c.primary}2E 0%, transparent 70%)`, borderRadius: '20px 20px 0 0', pointerEvents: 'none' }} />

            <div style={{ borderRadius: '20px 20px 0 0', overflow: 'hidden', background: '#D0EFF8', boxShadow: `0 -8px 64px ${c.primary}26, 0 0 0 1px ${c.primary}14`, position: 'relative' }}>
              <Image
                src={heroImage ?? client.hero.image}
                alt={client.hero.imageAlt}
                width={460}
                height={580}
                sizes="(max-width: 768px) 100vw, 460px"
                style={{ width: '100%', height: '540px', objectFit: 'cover', objectPosition: '50% 35%', transform: 'scale(1.15)', transformOrigin: '50% 35%' }}
                priority
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(to top, ${c.primary}14, transparent)` }} />
            </div>

            {/* Floating trust card */}
            {!hideDoctorCard && <div className="glass-card" style={{ position: 'absolute', bottom: 24, ...(heroCardAlign === 'left' ? { left: 16, right: 'auto' } : heroCardAlign === 'right' ? { right: 16, left: 'auto' } : { left: 0, right: 0, margin: '0 auto' }), width: 'fit-content', borderRadius: 16, padding: '16px 22px', minWidth: 240, zIndex: 10, whiteSpace: 'nowrap', backdropFilter: 'none', WebkitBackdropFilter: 'none', background: 'rgba(255,255,255,0.97)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.dark, marginBottom: 3 }}>{client.founder.name}</div>
              <div style={{ fontSize: 11, color: '#718096' }}>{client.founder.shortCreds}</div>
              {/* Rating row renders ONLY when a real public rating exists — never fabricate */}
              {client.founder.rating && client.founder.reviewCount && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 2 }}>{'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#F59E0B', fontSize: 12 }}>{s}</span>)}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.dark }}>{client.founder.rating}</span>
                  <span style={{ fontSize: 11, color: '#718096' }}>· {client.founder.reviewCount} reviews</span>
                </div>
              )}
            </div>}

            {/* Floating specialty chip */}
            <div className="glass-card" style={{ position: 'absolute', top: 32, right: -8, borderRadius: 12, padding: '8px 14px', zIndex: 10, textAlign: 'center', backdropFilter: 'none', WebkitBackdropFilter: 'none', background: 'rgba(255,255,255,0.97)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: c.primary, lineHeight: 1 }}>{client.hero.specialtyChip.title}</div>
              <div style={{ fontSize: 9, color: '#718096', marginTop: 2, fontWeight: 500 }}>{client.hero.specialtyChip.subtitle}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1b: HERO VIDEO (optional) ──
           Muted autoplay loop — the only autoplaying media on the page. Tap for
           sound. The label is not decoration: a sample is a labelled sample. */}
      {heroVideo && (
        <section className="mesh-bg-cream" style={{ padding: '40px 24px 56px' }}>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <video
              src={heroVideo.src}
              poster={heroVideo.poster}
              autoPlay muted loop playsInline controls preload="metadata"
              style={{ width: '100%', borderRadius: 20, display: 'block', background: c.dark, boxShadow: '0 20px 60px rgba(20,16,16,.22)' }}
            />
            {heroVideo.label && (
              <p style={{ marginTop: 14, textAlign: 'center', fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase', color: c.muted, fontFamily: client.fonts.body }}>
                {heroVideo.label}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── WAVE DIVIDER ── */}
      <div style={{ background: c.background, lineHeight: 0, margin: 0 }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
          <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill={c.primary} />
        </svg>
      </div>

      {/* ── SECTION 2: TRUST BAR ── */}
      <section ref={trustSection.ref} style={{ background: c.primary, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <div className="trust-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${client.trustStats.length}, 1fr)`, gap: 0, textAlign: 'center', position: 'relative' }}>
          {client.trustStats.map((item, i) => (
            <div key={item.label} className="trust-stat-item" style={{
              opacity: trustSection.inView ? 1 : 0,
              transform: trustSection.inView ? 'none' : 'translateY(16px)',
              transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
              padding: '0 28px',
              borderRight: i < client.trustStats.length - 1 ? '1px solid rgba(255,255,255,0.18)' : 'none',
            }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WAVE DIVIDER bottom ── */}
      <div style={{ background: '#fff', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
          <path d="M0,20 C360,0 1080,40 1440,20 L1440,0 L0,0 Z" fill={c.primary} />
        </svg>
      </div>

      {/* ── SECTION 3: PAIN POINTS ── */}
      <section className="mesh-bg-teal-pale" ref={painSection.ref} style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48, opacity: painSection.inView ? 1 : 0, transform: painSection.inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <span className="eyebrow-pill">{client.sectionCopy.painEyebrow}</span>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: c.dark, marginBottom: 10, letterSpacing: '-0.02em' }}>
              {client.sectionCopy.painHeading}
            </h2>
            <div style={{ height: 3, width: painSection.inView ? 56 : 0, background: `linear-gradient(90deg, ${c.primary}, ${c.primaryHover})`, borderRadius: 2, margin: '6px auto 12px', transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.35s' }} />
            <p style={{ color: '#718096', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
              {client.sectionCopy.painSub}
            </p>
          </div>

          <div className="pain-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {painPoints.map((point, i) => (
              <div key={i} style={{
                opacity: painSection.inView ? 1 : 0,
                transform: painSection.inView ? 'none' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
              }}>
                <div className="pain-card" style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '28px 28px',
                  display: 'flex', gap: 20, alignItems: 'flex-start',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  height: '100%',
                }}>
                  <div className="pain-icon" style={{
                    flexShrink: 0, width: 44, height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${c.urgency}12`,
                    borderRadius: '50%',
                    border: `1px solid ${c.urgency}2E`,
                  }}>
                    {PAIN_ICONS[i % PAIN_ICONS.length]}
                  </div>
                  <div>
                    <span style={{ fontSize: 15, color: '#2D3748', lineHeight: 1.65, fontWeight: 500 }}>{point}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3b: BEFORE / AFTER (optional) ──
           The objection-killer gets its own section. Click-to-play, sound ON by
           default when played — the audio difference is half the argument. */}
      {beforeAfterVideo && (
        <section className="mesh-bg-white" style={{ padding: '72px 24px' }}>
          <div style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: c.primary, fontFamily: client.fonts.body, marginBottom: 12 }}>
              Don&apos;t take my word for it
            </p>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 34, lineHeight: 1.15, color: c.dark, marginBottom: 18 }}>
              &ldquo;But AI videos look fake.&rdquo;
            </h2>
            <video
              src={beforeAfterVideo.src}
              poster={beforeAfterVideo.poster}
              controls playsInline preload="none"
              style={{ width: '100%', borderRadius: 20, display: 'block', background: c.dark, boxShadow: '0 20px 60px rgba(20,16,16,.22)' }}
            />
            {beforeAfterVideo.caption && (
              <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6, color: c.muted, fontFamily: client.fonts.body }}>
                {beforeAfterVideo.caption}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── SECTION 4: SOLUTION ── */}
      <section className="mesh-bg-cream" ref={solutionSection.ref} style={{ padding: '80px 24px' }}>
        <div className="solution-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* Left photo */}
          <div className="solution-image-col" style={{ position: 'relative', opacity: solutionSection.inView ? 1 : 0, transform: solutionSection.inView ? 'none' : 'translateX(-28px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.12)', position: 'relative' }}>
              <Image
                src={solutionImage ?? client.solution.image}
                alt={client.solution.imageAlt}
                width={520}
                height={580}
                sizes="(max-width: 768px) 100vw, 520px"
                style={{ width: '100%', height: '480px', objectFit: 'cover', objectPosition: '50% 35%' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${c.primary}14 0%, transparent 60%)` }} />
            </div>
            <div className="solution-deco-border" style={{ position: 'absolute', top: -16, left: -16, right: 16, bottom: 16, borderRadius: 28, border: `1.5px solid ${c.primary}33`, zIndex: -1, pointerEvents: 'none' }} />
          </div>

          {/* Right copy */}
          <div style={{ opacity: solutionSection.inView ? 1 : 0, transform: solutionSection.inView ? 'none' : 'translateX(28px)', transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s' }}>
            <span className="eyebrow-pill">{client.solution.eyebrow}</span>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, color: c.dark, lineHeight: 1.15, marginBottom: 28, letterSpacing: '-0.02em' }}>
              {client.solution.heading} <span className="gradient-text">{client.solution.headingAccent}</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {solutionPoints.map((point, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  opacity: solutionSection.inView ? 1 : 0,
                  transform: solutionSection.inView ? 'none' : 'translateX(16px)',
                  transition: `opacity 0.5s ease ${0.2 + i * 0.1}s, transform 0.5s ease ${0.2 + i * 0.1}s`,
                }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${c.primary}, ${c.primaryHover})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, boxShadow: `0 4px 12px ${c.primary}59` }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 15, color: '#4A5568', lineHeight: 1.7 }}>{point}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 36 }}>
              <a href="#callback-form" onClick={scrollToForm} className="cta-btn">
                {ctaLabel} →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ── */}
      <section className="mesh-bg-dark" ref={stepsSection.ref} style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: `radial-gradient(circle, ${c.primary}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 56, opacity: stepsSection.inView ? 1 : 0, transform: stepsSection.inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <span className="eyebrow-pill-dark">{client.sectionCopy.stepsEyebrow}</span>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>
              {client.sectionCopy.stepsHeading}
            </h2>
            <div style={{ height: 3, width: stepsSection.inView ? 56 : 0, background: `linear-gradient(90deg, ${c.primary}, ${c.primaryHover})`, borderRadius: 2, margin: '0 auto 12px', transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.35s' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>{client.sectionCopy.stepsSub}</p>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${client.steps.length}, 1fr)`, gap: stepsCompact ? 16 : 24, position: 'relative' }}>
            {/* connector line */}
            <div className="steps-connector" style={{ position: 'absolute', top: stepsCompact ? 44 : 52, left: `${stepsHalfCell}%`, right: `${stepsHalfCell}%`, height: 1, background: `linear-gradient(90deg, transparent, ${c.primary}66 20%, ${c.primary}66 80%, transparent)`, pointerEvents: 'none' }} />

            {client.steps.map((step, i) => (
              <div key={step.num} style={{
                opacity: stepsSection.inView ? 1 : 0,
                transform: stepsSection.inView ? 'none' : 'translateY(24px)',
                transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`,
              }}>
                <div className="step-card" style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderTop: `2px solid ${c.primary}80`,
                  borderRadius: 20,
                  padding: stepsCardPad,
                  backdropFilter: 'blur(16px)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                }}>
                  <div style={{ position: 'absolute', bottom: -12, right: 12, fontSize: 80, fontWeight: 900, color: 'rgba(255,255,255,0.03)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', fontFamily: client.fonts.heading }}>{step.num}</div>
                  {/* Numbered stamp badge */}
                  <div style={{ position: 'absolute', top: 14, left: 14, background: `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 11px', borderRadius: 20, letterSpacing: '0.1em', boxShadow: `0 4px 12px ${c.primary}59` }}>
                    {step.num}
                  </div>
                  <div className="step-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: stepsIconSize, height: stepsIconSize, borderRadius: '50%', background: `linear-gradient(135deg, ${c.primary}40, ${c.primaryHover}26)`, border: `1.5px solid ${c.primary}66`, marginBottom: 16, boxShadow: `0 0 24px ${c.primary}26` }}>
                    {STEP_ICONS[i % STEP_ICONS.length]}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.primaryHover, letterSpacing: '0.14em', marginBottom: 8, textTransform: 'uppercase' }}>Step {step.num}</div>
                  <div style={{ fontSize: stepsTitleSize, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: DOCTOR TRUST ── */}
      <section className="mesh-bg-white" ref={doctorSection.ref} style={{ padding: '80px 24px' }}>
        <div className="doctor-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 60, alignItems: 'center' }}>

          {/* Photo */}
          <div className="doctor-image-col" style={{ position: 'relative', opacity: doctorSection.inView ? 1 : 0, transform: doctorSection.inView ? 'none' : 'translateX(-28px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
            {/* Dot grid decoration */}
            <div style={{ position: 'absolute', top: -24, left: -24, width: 'calc(100% + 48px)', height: 'calc(100% + 48px)', backgroundImage: `radial-gradient(circle, ${c.primary}3D 1.5px, transparent 1.5px)`, backgroundSize: '20px 20px', borderRadius: 32, zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}>
              <Image
                src={client.founder.photo}
                alt={`${client.founder.name} — ${client.founder.shortCreds}`}
                width={320}
                height={440}
                style={{ width: '100%', height: '440px', objectFit: 'cover', objectPosition: '50% 12%' }}
              />
            </div>
            {/* Credential card */}
            <div className="glass-card doctor-credential-card" style={{ position: 'absolute', bottom: -20, right: -20, borderRadius: 16, padding: '14px 20px', zIndex: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: c.dark }}>{client.founder.shortCreds.split('·')[0].trim()}</div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{client.founder.shortCreds.split('·').slice(1).join('·').trim()}</div>
              {/* Rating shown ONLY when a real public rating exists — never fabricate */}
              {client.founder.rating && <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 4 }}>★★★★★  {client.founder.rating}</div>}
            </div>
          </div>

          {/* Copy */}
          <div style={{ opacity: doctorSection.inView ? 1 : 0, transform: doctorSection.inView ? 'none' : 'translateX(28px)', transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s' }}>
            <span className="eyebrow-pill">{client.sectionCopy.founderEyebrow}</span>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: c.dark, marginBottom: 6, letterSpacing: '-0.02em' }}>{client.founder.name}</h2>
            <div style={{ height: 3, width: doctorSection.inView ? 48 : 0, background: `linear-gradient(90deg, ${c.primary}, ${c.primaryHover})`, borderRadius: 2, margin: '6px 0 16px', transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.35s' }} />
            <div style={{ fontSize: 14, color: '#718096', marginBottom: 28, fontWeight: 500 }}>{client.founder.credentials}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {client.founderPoints.map((point, i) => (
                <div key={i} style={{
                  opacity: doctorSection.inView ? 1 : 0,
                  transform: doctorSection.inView ? 'none' : 'translateX(16px)',
                  transition: `opacity 0.5s ease ${0.15 + i * 0.1}s, transform 0.5s ease ${0.15 + i * 0.1}s`,
                }}>
                  <div className="doctor-point-card" style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.9)',
                    borderLeft: `3px solid ${c.primary}`,
                    borderRadius: 12, padding: '14px 18px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${c.primary}, ${c.primaryHover})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${c.primary}59` }}>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6 }}>{point}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: TESTIMONIALS ── */}
      <section className="mesh-bg-cream" ref={testiSection.ref} style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: `radial-gradient(circle, ${c.primary}0D 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 48, opacity: testiSection.inView ? 1 : 0, transform: testiSection.inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <span className="eyebrow-pill">{client.sectionCopy.testimonialsEyebrow}</span>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: c.dark, letterSpacing: '-0.02em' }}>{client.sectionCopy.testimonialsHeading}</h2>
            <div style={{ height: 3, width: testiSection.inView ? 56 : 0, background: `linear-gradient(90deg, ${c.primary}, ${c.primaryHover})`, borderRadius: 2, margin: '8px auto 0', transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.35s' }} />
          </div>

          {/* ── Testimonial slider ── */}
          <div style={{ maxWidth: 720, margin: '0 auto', opacity: testiSection.inView ? 1 : 0, transform: testiSection.inView ? 'none' : 'translateY(24px)', transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s' }}>

            {/* Horizontal sliding track */}
            {testimonials.length > 0 && (
              <div style={{ overflow: 'hidden', borderRadius: 24, padding: '2px' }}>
                <div style={{
                  display: 'flex',
                  width: `${testimonials.length * 100}%`,
                  transform: `translateX(-${testiIndex * (100 / testimonials.length)}%)`,
                  transition: reducedMotion ? 'none' : 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                  {testimonials.map((testi, i) => (
                    <div key={i} className="glass-testimonial" style={{
                      width: `${100 / testimonials.length}%`,
                      flexShrink: 0,
                      borderRadius: 24,
                      padding: '40px 40px 32px',
                      border: `2px solid ${c.primary}59`,
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: 260,
                      boxSizing: 'border-box',
                    }}>
                      {/* Large decorative quote mark */}
                      <div style={{ position: 'absolute', top: -16, right: 24, fontSize: 130, color: `${c.primary}12`, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>&ldquo;</div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {'★★★★★'.split('').map((s, si) => <span key={si} style={{ color: '#F59E0B', fontSize: 16 }}>{s}</span>)}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#718096', background: c.background, padding: '4px 12px', borderRadius: 20, letterSpacing: '0.05em' }}>{client.sectionCopy.testimonialBadge}</div>
                      </div>

                      <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.9, margin: '0 0 28px', fontStyle: 'italic', fontWeight: 400, position: 'relative' }}>
                        &ldquo;{testi.quote}&rdquo;
                      </p>

                      {testi.name && (
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center', paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${c.primary}, ${c.primaryHover})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${c.primary}4D`, flexShrink: 0 }}>
                            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{testi.name.charAt(0)}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: c.dark }}>{testi.name}</div>
                            {testi.location && (
                              <div style={{ fontSize: 12, color: c.primary, fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                {testi.location}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation: prev · dots · next */}
            {testimonials.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 28 }}>
                <button onClick={testiPrev} className="testi-arrow-btn" aria-label="Previous testimonial">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {testimonials.map((_, di) => (
                    <button
                      key={di}
                      onClick={() => setTestiIndex(di)}
                      aria-label={`Go to testimonial ${di + 1}`}
                      style={{
                        width: di === testiIndex ? 28 : 8, height: 8, borderRadius: 4,
                        background: di === testiIndex ? c.primary : `${c.primary}40`,
                        border: 'none', cursor: 'pointer', padding: 0,
                        transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.35s ease',
                      }}
                    />
                  ))}
                </div>

                <button onClick={testiNext} className="testi-arrow-btn" aria-label="Next testimonial">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 7b: DEMO WALL (optional) ── */}
      {demoVideos && demoVideos.length > 0 && (
        <section className="mesh-bg-white" style={{ padding: '72px 24px' }}>
          <div style={{ maxWidth: 460, margin: '0 auto' }}>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 32, lineHeight: 1.15, color: c.dark, marginBottom: 22, textAlign: 'center' }}>
              More of the work
            </h2>
            <div style={{ display: 'grid', gap: 20 }}>
              {demoVideos.map((v, i) => (
                <div key={i}>
                  <video src={v.src} poster={v.poster} controls playsInline preload="none"
                    style={{ width: '100%', borderRadius: 16, display: 'block', background: c.dark }} />
                  <p style={{ marginTop: 10, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', color: c.muted, fontFamily: client.fonts.body }}>{v.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 7c: OFFER TIERS (optional) ──
           Prices come from the locked table in the growth plan §5.3. A lower model
           pricing a custom package works from that table — never improvises here. */}
      {offerTiers && offerTiers.length > 0 && (
        <section className="mesh-bg-cream" style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 460, margin: '0 auto' }}>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 34, lineHeight: 1.15, color: c.dark, marginBottom: 26, textAlign: 'center' }}>
              What it costs
            </h2>
            <div style={{ display: 'grid', gap: 18 }}>
              {offerTiers.map((t, i) => (
                <div key={i} style={{
                  background: t.highlight ? c.dark : '#fff',
                  border: `2px solid ${t.highlight ? c.primary : 'rgba(20,16,16,.10)'}`,
                  borderRadius: 20, padding: '26px 24px',
                  boxShadow: t.highlight ? '0 22px 60px rgba(20,16,16,.25)' : '0 6px 22px rgba(20,16,16,.06)',
                }}>
                  <p style={{ fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: t.highlight ? c.gold : c.muted, fontFamily: client.fonts.body, marginBottom: 8 }}>{t.name}</p>
                  <p style={{ fontFamily: client.fonts.heading, fontSize: 38, lineHeight: 1.05, color: t.highlight ? '#fff' : c.dark, marginBottom: t.note ? 4 : 14 }}>{t.price}</p>
                  {t.note && <p style={{ fontSize: 14, color: t.highlight ? 'rgba(255,255,255,.72)' : c.muted, fontFamily: client.fonts.body, marginBottom: 14 }}>{t.note}</p>}
                  <ul style={{ listStyle: 'none', display: 'grid', gap: 9 }}>
                    {t.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: 15, lineHeight: 1.55, color: t.highlight ? 'rgba(255,255,255,.88)' : c.dark, fontFamily: client.fonts.body, paddingLeft: 20, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: c.primary }}>&#8226;</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 7d: THE HONESTY BLOCK (optional) ──
           This section is the differentiator. Do not soften it, do not shorten it,
           and do not move it below the FAQ. */}
      {honestyBlock && (
        <section className="mesh-bg-dark" style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: 460, margin: '0 auto' }}>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 34, lineHeight: 1.18, color: '#fff', marginBottom: 22 }}>
              {honestyBlock.heading}
            </h2>
            {honestyBlock.paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.72, color: 'rgba(255,255,255,.82)', fontFamily: client.fonts.body, marginBottom: 16 }}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 8: FAQ ── */}
      <section className="mesh-bg-white" ref={faqSection.ref} style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48, opacity: faqSection.inView ? 1 : 0, transform: faqSection.inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <span className="eyebrow-pill">Got questions?</span>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: c.dark, letterSpacing: '-0.02em' }}>Common questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: openFaq === i ? '#fff' : c.background,
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${openFaq === i ? `${c.primary}40` : 'transparent'}`,
                boxShadow: openFaq === i ? `0 4px 24px ${c.primary}14` : 'none',
                opacity: faqSection.inView ? 1 : 0,
                transform: faqSection.inView ? 'none' : 'translateY(16px)',
                transition: `background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease, opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`,
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, fontWeight: 600, color: c.dark, gap: 16 }}>
                  <span>{faq.question}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: openFaq === i ? `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})` : `${c.primary}1A`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.35s ease',
                    boxShadow: openFaq === i ? `0 4px 12px ${c.primary}59` : 'none',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s ease' }}>
                      <path d="M2 5l5 5 5-5" stroke={openFaq === i ? '#fff' : c.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
                <div style={{ maxHeight: openFaq === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <div style={{ padding: '0 24px 22px', fontSize: 14, color: '#718096', lineHeight: 1.9, borderTop: `1px solid ${c.primary}14` }}>
                    <div style={{ paddingTop: 16 }}>{faq.answer}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: CALLBACK FORM ── */}
      <section id="callback-form" className="mesh-bg-cream" style={{ padding: '80px 24px' }}>
        <div className="form-section-grid" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'end' }}>

          {/* Doctor photo — left column (desktop only) */}
          <div className="form-doctor-col" style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.14)' }}>
            <Image
              src={client.founder.photo}
              alt={client.founder.name}
              width={460}
              height={520}
              style={{ width: '100%', height: '520px', objectFit: 'cover', objectPosition: '50% 12%' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${c.dark}DF 0%, transparent 52%)` }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px', zIndex: 10 }}>
              <p style={{ fontFamily: client.fonts.serif, fontSize: 16, color: '#fff', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 14px' }}>
                &ldquo;Your growth, run by the person who actually builds it.&rdquo;
              </p>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>{client.founder.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{client.founder.shortCreds}</div>
            </div>
          </div>

          {/* Form — right column */}
          <div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40, opacity: formSection.inView ? 1 : 0, transform: formSection.inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
            <span className="eyebrow-pill">{client.sectionCopy.formEyebrow}</span>
            <h2 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: c.dark, letterSpacing: '-0.02em', marginBottom: 10 }}>
              {client.sectionCopy.formHeading}
            </h2>
            <p style={{ fontSize: 15, color: '#718096', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
              {client.sectionCopy.formSub}
            </p>
          </div>

          {/* Form / Success */}
          <div ref={formSection.ref} style={{ opacity: formSection.inView ? 1 : 0, transform: formSection.inView ? 'none' : 'translateY(20px)', transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s' }}>
            {!formSubmitted ? (
              <form onSubmit={handleFormSubmit} style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 8px 48px rgba(0,0,0,0.07)', border: `1px solid ${c.primary}1A` }}>

                {/* Name + Phone row */}
                <div className="callback-form-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', letterSpacing: '0.04em' }}>YOUR NAME</label>
                    <input
                      ref={nameInputRef}
                      className="callback-input"
                      type="text"
                      placeholder={client.form.namePlaceholder}
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: formPhoneError ? '#E53E3E' : '#4A5568', letterSpacing: '0.04em' }}>PHONE NUMBER</label>
                    <input
                      className={`callback-input${formPhoneError ? ' callback-input-error' : ''}`}
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={formPhone}
                      onChange={e => { setFormPhone(e.target.value); if (formPhoneError) setFormPhoneError(''); }}
                      onBlur={e => { if (e.target.value) setFormPhoneError(validatePhone(e.target.value)); }}
                      required
                      autoComplete="tel"
                    />
                    {formPhoneError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#E53E3E', fontWeight: 500 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {formPhoneError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Best time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', letterSpacing: '0.04em' }}>BEST TIME TO CALL</label>
                  <select
                    className="callback-input"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Any time is fine</option>
                    {client.form.timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 50, border: 'none',
                    background: formSubmitting ? '#A0AEC0' : `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`,
                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: formSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: formSubmitting ? 'none' : `0 6px 28px ${c.primary}59`,
                    transition: 'all 0.25s ease',
                    letterSpacing: '0.01em',
                  }}>
                  {formSubmitting ? 'Sending…' : 'Book My Free Assessment →'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 12, color: '#A0AEC0', marginTop: 16, marginBottom: 0 }}>
                  {client.sectionCopy.formPrivacyNote} · {client.hours} · Your number stays private
                </p>
              </form>
            ) : (
              /* Success state */
              <div id="form-success" style={{ textAlign: 'center', background: '#fff', borderRadius: 24, padding: '48px 32px', boxShadow: '0 8px 48px rgba(0,0,0,0.07)', border: `1px solid ${c.primary}33` }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${c.primary}, ${c.primaryHover})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 8px 24px ${c.primary}40` }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: client.fonts.heading, fontSize: 22, fontWeight: 800, color: c.dark, marginBottom: 10 }}>
                  We&apos;ve got your details!
                </h3>
                <p style={{ fontSize: 15, color: '#718096', lineHeight: 1.7, maxWidth: 320, margin: '0 auto 20px' }}>
                  {client.sectionCopy.successNote}<br />
                  <span style={{ fontWeight: 600, color: c.dark }}>{client.hours}</span>
                </p>
                <p style={{ fontSize: 13, color: '#A0AEC0', marginBottom: 12 }}>Prefer to chat right now?</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => fireCapiEvent('Contact')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#25D366', color: '#fff',
                    padding: '12px 24px', borderRadius: 50,
                    fontSize: 14, fontWeight: 700, textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.859L.057 23.428a.75.75 0 00.916.916l5.569-1.475A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.524-5.188-1.437l-.372-.22-3.304.875.875-3.304-.22-.372A9.951 9.951 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  Chat on WhatsApp
                </a>
              </div>
            )}
          </div>
          </div>{/* end form right column */}
        </div>
      </section>

      {/* ── SECTION 10: FINAL CTA ── */}
      <section ref={ctaSection.ref} className="noise-overlay" style={{ background: `linear-gradient(135deg, ${c.primaryDark} 0%, ${c.primary} 50%, ${c.primaryHover} 100%)`, padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', opacity: ctaSection.inView ? 1 : 0, transform: ctaSection.inView ? 'none' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50, padding: '8px 20px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="rgba(255,255,255,0.9)"/></svg>
              <span style={{ fontFamily: client.fonts.heading, fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.95)', letterSpacing: '0.02em' }}>{client.businessName}</span>
            </div>
          </div>
          <h2 style={{ fontFamily: client.fonts.heading, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            {client.sectionCopy.finalCtaHeading}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 36, lineHeight: 1.7 }}>
            {client.hours}<br />{client.address}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={callUrl} onClick={() => fireCapiEvent('Contact')} style={{
              background: '#fff', color: c.primary, padding: '16px 32px', borderRadius: 50,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Call Now
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => fireCapiEvent('Contact')} style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '16px 32px', borderRadius: 50,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              border: '1.5px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.25s ease',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              WhatsApp Us ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: c.dark, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{client.businessName}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            {client.addressFull} · <a href={`tel:${client.phone}`} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>{client.phone}</a>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginTop: 4 }}>
            <a href="/privacy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy Policy</a>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>·</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} {client.businessName}. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ── FLOATING ACTION BUBBLES ── */}
      <div style={{
        position: 'fixed',
        bottom: 28, right: 20, zIndex: 300,
        display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end',
        opacity: scrolled ? 1 : 0,
        transform: scrolled ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        pointerEvents: scrolled ? 'auto' : 'none',
      }}>
        <a href={callUrl} onClick={() => fireCapiEvent('Contact')} className="fab-bubble" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: `linear-gradient(135deg, ${c.primary}, ${c.primaryDark})`,
          color: '#fff', padding: '13px 22px', borderRadius: 50,
          fontSize: 14, fontWeight: 700, textDecoration: 'none',
          boxShadow: `0 6px 28px ${c.primary}80, 0 2px 8px rgba(0,0,0,0.12)`,
          whiteSpace: 'nowrap',
          animation: reducedMotion ? 'none' : 'pulseGlow 3s ease-in-out infinite',
          border: '1.5px solid rgba(255,255,255,0.25)',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          <span className="fab-label">Call Now</span>
        </a>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => fireCapiEvent('Contact')} className="fab-bubble" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#25D366', color: '#fff', padding: '13px 22px', borderRadius: 50,
          fontSize: 14, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 6px 28px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.12)',
          whiteSpace: 'nowrap',
          border: '1.5px solid rgba(255,255,255,0.25)',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.998-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
          </svg>
          <span className="fab-label">WhatsApp</span>
        </a>
      </div>

    </div>
  );
}

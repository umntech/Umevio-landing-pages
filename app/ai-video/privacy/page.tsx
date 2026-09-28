import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';

/**
 * /ai-video/privacy — the privacy policy for the /ai-video page only.
 *
 * Why a page of its own and not a link to umevio.com/privacy-policy.html: that
 * policy says the site uses no advertising cookies and collects email, and
 * that the Meta Pixel is "disclosed separately on the relevant pages". This is
 * that disclosure. /ai-video collects a WhatsApp number and runs the Meta
 * Pixel, the Conversions API and GA4, so linking the main-site policy would
 * describe the page wrongly.
 *
 * Keep it true to the code: if the form fields, the tracking or a provider
 * changes (components/AiVideoLanding.tsx, app/api/capi/route.ts,
 * app/layout.tsx), change this page in the same commit.
 */

export const metadata: Metadata = {
  title: 'Privacy policy — Umevio AI video',
  description: 'What the Umevio AI video page collects, why, who processes it, and how to have it deleted.',
  robots: { index: true, follow: true },
};

const C = { bg: '#1C1208', paper: '#FAF6F0', dust: '#F0E9DF', muted: '#A89880', rouge: '#D94F3D', line: 'rgba(240,233,223,.12)' };
const SERIF = 'var(--font-dmserif), Georgia, serif';

const h2: CSSProperties = { fontFamily: SERIF, fontSize: 26, lineHeight: 1.2, color: C.paper, margin: '40px 0 12px', fontWeight: 400 };
const p: CSSProperties = { fontSize: 16, lineHeight: 1.7, color: C.dust, margin: '0 0 12px' };
const li: CSSProperties = { fontSize: 16, lineHeight: 1.7, color: C.dust, margin: '0 0 8px' };

function List({ items }: { items: ReactNode[] }) {
  return <ul style={{ listStyle: 'disc', paddingLeft: 22, margin: '0 0 12px' }}>{items.map((x, i) => <li key={i} style={li}>{x}</li>)}</ul>;
}

export default function PrivacyPage() {
  return (
    <main style={{ background: C.bg, color: C.dust, minHeight: '100vh', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <a href="/ai-video" style={{ color: C.muted, fontSize: 15, textDecoration: 'none' }}>&larr; Back to the page</a>

        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(36px, 7vw, 52px)', lineHeight: 1.08, color: C.paper, margin: '28px 0 10px', fontWeight: 400 }}>
          Privacy policy
        </h1>
        <p style={{ ...p, color: C.muted }}>For the Umevio AI video page (ads.umevio.com/ai-video). Effective 28 September 2026.</p>

        <h2 style={h2}>Who is responsible</h2>
        <p style={p}>
          Umevio, a studio in India run by Sreevin, registered under the MSME Act (Udyam). Questions or requests about your data:{' '}
          <a href="mailto:hello@umevio.com" style={{ color: C.rouge }}>hello@umevio.com</a>.
        </p>

        <h2 style={h2}>What this page collects</h2>
        <p style={p}><strong style={{ color: C.paper }}>If you fill in the form:</strong></p>
        <List items={[
          'your name and WhatsApp number',
          'if you choose to answer: what you do, what has stopped you posting video, and a budget range',
          'which plan you asked about, if you came from a price card',
          'which ad or link brought you here (for example utm_content and the Facebook click ID in the page address)',
        ]} />
        <p style={p}><strong style={{ color: C.paper }}>Whether or not you fill it in:</strong> pages viewed, taps on the WhatsApp and Call buttons, your IP address, browser and device type, and the cookies described below.</p>
        <p style={p}>If you message on WhatsApp or call, that conversation happens in WhatsApp or your phone app, not on this page.</p>

        <h2 style={h2}>Why</h2>
        <List items={[
          'to reply to your enquiry and arrange the call you asked for',
          'to see which ads bring real enquiries, and to show the ads to people more likely to find them useful',
        ]} />
        <p style={p}>Your details are not sold, and you will not be added to a marketing list without being asked.</p>

        <h2 style={h2}>Measurement: Meta and Google</h2>
        <p style={p}>
          <strong style={{ color: C.paper }}>Meta Pixel and Meta Conversions API.</strong> When the page loads, when you send the form, and when you tap WhatsApp or Call,
          the page tells Meta (Facebook and Instagram) that it happened. With a form enquiry it also sends your phone number and first name, but only
          hashed: scrambled one way on our server before they leave it, so Meta can match the enquiry to an ad click without receiving the raw details.
          Meta also receives your IP address, browser details and its own click cookies.
        </p>
        <p style={p}>
          <strong style={{ color: C.paper }}>Google Analytics 4.</strong> Counts page views, form enquiries and WhatsApp or Call taps. No name or phone number is sent to Google.
        </p>

        <h2 style={h2}>Cookies</h2>
        <List items={[
          <><strong style={{ color: C.paper }}>_fbp, _fbc</strong> (Meta): recognise a browser and the ad click it came from. Up to 90 days.</>,
          <><strong style={{ color: C.paper }}>_ga, _ga_*</strong> (Google Analytics): count visits. Up to 2 years.</>,
        ]} />
        <p style={p}>
          You can block or delete these in your browser settings; the page still works. You can also limit ad personalisation in your Facebook or
          Instagram ad preferences.
        </p>

        <h2 style={h2}>Who processes it for us</h2>
        <List items={[
          'Formspree: delivers the form to our inbox',
          'Meta Platforms: the Pixel and Conversions API above',
          'Google: Analytics 4',
          'Vercel: hosts the page',
          'Cloudflare: delivers the videos',
        ]} />
        <p style={p}>Some of these providers store data outside India.</p>

        <h2 style={h2}>How long it is kept</h2>
        <p style={p}>
          Enquiries are kept while we are talking or working together, and for up to 2 years after the last contact, then deleted. You can ask for
          deletion sooner at any time.
        </p>

        <h2 style={h2}>Your rights</h2>
        <p style={p}>
          Under Indian law, including the Digital Personal Data Protection Act, 2023, you can ask to see, correct or delete your data, or withdraw consent.
          Email <a href="mailto:hello@umevio.com" style={{ color: C.rouge }}>hello@umevio.com</a> and you will get a reply within 7 business days.
        </p>

        <h2 style={h2}>Changes</h2>
        <p style={p}>If this policy changes, the effective date at the top changes with it.</p>

        <p style={{ ...p, color: C.muted, marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.line}` }}>
          The main umevio.com site has its own policy at{' '}
          <a href="https://www.umevio.com/privacy-policy.html" style={{ color: C.muted }}>umevio.com/privacy-policy.html</a>.
        </p>
      </div>
    </main>
  );
}

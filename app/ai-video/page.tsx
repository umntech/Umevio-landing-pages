import type { Metadata } from 'next';
import AiVideoLanding from '@/components/AiVideoLanding';

/**
 * /ai-video — the AI talking-head video service page.
 *
 * Built from scratch on the REAL umevio.com design system (warm-dark ground,
 * rouge accent, DM Serif Display + Outfit), NOT on the inherited Proalign
 * LandingPage template — which is light-themed, dental-shaped, and still has
 * Proalign's teal hardcoded through it.
 *
 * Content and prices come from the founder-confirmed table in
 * clients/umevio/growth-system/12-ai-video-growth-plan.md §5.3. Change the plan
 * first, then this file — never improvise a price here.
 *
 * GUARDRAIL: no invented numbers anywhere. Every figure on this page is a price,
 * a duration or a capacity, and all of them are true.
 */

export const metadata: Metadata = {
  title: 'AI Video Content Engine — Umevio',
  description:
    'Your own AI avatar, a reel every week, without filming. Scripted, edited, honestly labelled AI video for doctors, coaches and founders who cannot keep filming. Built by the person who also runs the ads.',
  robots: { index: true, follow: true },
  /* The share card is built by scripts/build-og-image.cjs and committed to
     public/images/ai-video/og.png. It is NOT generated at request time: Next 14
     bundles a copy of @vercel/og that calls path.join() on a file:// URL, which
     Windows mangles, so the opengraph-image.tsx convention crashes `next build`
     on any Windows machine. Re-run the script if the headline or brand changes. */
  openGraph: {
    title: 'Your own AI avatar. A reel every week. — Umevio',
    description:
      'AI video for doctors, coaches and founders who cannot keep filming. Fifteen minutes of recording, once. Scripts written, videos edited, every one labelled.',
    type: 'website',
    siteName: 'Umevio',
    images: [{ url: '/images/ai-video/og.png', width: 1200, height: 630, alt: 'Umevio — Your own AI avatar. A reel every week.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your own AI avatar. A reel every week. — Umevio',
    description:
      'AI video for doctors, coaches and founders who cannot keep filming. Fifteen minutes of recording, once.',
    images: ['/images/ai-video/og.png'],
  },
};

export default function AiVideoPage() {
  return <AiVideoLanding />;
}

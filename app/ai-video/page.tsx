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
    'Record once, post every day. Scripted, edited, honestly labelled AI video for coaches and founders who cannot keep filming. Built by the person who also runs the ads.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Record once. Post every day. — Umevio',
    description:
      'AI video for coaches and founders who cannot keep filming. Fifteen minutes of recording, once. Scripts written, videos edited, every one labelled.',
    type: 'website',
  },
};

export default function AiVideoPage() {
  return <AiVideoLanding />;
}

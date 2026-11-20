import type { Metadata } from 'next';
import AiVideoLanding from '@/components/AiVideoLanding';

/**
 * /samples — the /ai-video page with no prices, for leads who already hold a
 * private quote (UAE clients, partners). /ai-video carries the India ₹ pricing
 * for the India ads; a quoted lead must never see a second, different price.
 * Not indexed, and fires no ad events (see the `samples` prop).
 */

export const metadata: Metadata = {
  title: 'AI Video Samples — Umevio',
  description:
    'Real client videos made with AI avatars: one recording, scripts written, fully edited, every one labelled as AI.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'AI video samples — Umevio',
    description: 'Real client videos made with AI avatars. One recording, fully edited, every one labelled.',
    type: 'website',
    siteName: 'Umevio',
    images: [{ url: '/images/ai-video/og.png', width: 1200, height: 630, alt: 'Umevio — Your own AI avatar. A reel every week.' }],
  },
};

export default function SamplesPage() {
  return <AiVideoLanding samples />;
}

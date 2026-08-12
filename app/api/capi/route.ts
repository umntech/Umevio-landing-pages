import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/client.config';

export async function POST(req: NextRequest) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'META_CAPI_TOKEN not set' }, { status: 500 });
  }

  const { event_name, event_id, page_url } = await req.json();
  if (!event_name || !event_id) {
    return NextResponse.json({ error: 'event_name and event_id required' }, { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const ua = req.headers.get('user-agent') ?? '';

  const payload = {
    data: [{
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      action_source: 'website',
      event_source_url: page_url ?? '',
      user_data: {
        client_ip_address: ip,
        client_user_agent: ua,
      },
    }],
  };

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${client.tracking.pixelId}/events?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.ok ? 200 : 400 });
}

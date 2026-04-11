import { NextResponse } from 'next/server';
import { getAnthropicClient, buildLinkedInPrompt } from '@/lib/anthropic';
import { createClient, getAdminClient } from '@/lib/supabase-server';

function getIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, yourName, yourBackground, recipientName, recipientTitle, company, role, mutualContext, language } = body;

    if (!company?.trim()) {
      return NextResponse.json({ error: 'Company is required.' }, { status: 400 });
    }

    // Rate limit: 3/day for anon, unlimited for pro
    const admin = getAdminClient();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const ip = getIp(request);

    if (!user) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count } = await admin
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', startOfDay.toISOString());
      if (count >= 3) {
        return NextResponse.json({ error: 'Rate limit reached', reason: 'daily_limit_reached' }, { status: 429 });
      }
    }

    const prompt = buildLinkedInPrompt({ type, yourName, yourBackground, recipientName, recipientTitle, company, role, mutualContext, language });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = getAnthropicClient().messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }],
          });
          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          await admin.from('generations').insert({ ip_address: ip, user_id: user?.id || null });
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  } catch (err) {
    console.error('LinkedIn error:', err);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getAnthropicClient, buildRefinementPrompt } from '@/lib/anthropic';
import { createClient, getAdminClient } from '@/lib/supabase-server';

function getIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

async function getSubscriber(admin, userId, email) {
  if (userId) {
    const { data } = await admin.from('subscribers').select('is_pro').eq('user_id', userId).single();
    if (data) return data;
  }
  if (email) {
    const { data } = await admin.from('subscribers').select('is_pro, user_id').eq('email', email).single();
    if (data && userId && !data.user_id) {
      await admin.from('subscribers').update({ user_id: userId }).eq('email', email);
    }
    return data;
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { currentLetter, feedback, jobTitle, company, language } = body;

    if (!currentLetter || !feedback?.trim()) {
      return NextResponse.json({ error: 'Missing letter or feedback' }, { status: 400 });
    }

    const admin = getAdminClient();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const ip = getIp(request);

    // Same rate limiting as generate — refinement counts as a generation
    if (user) {
      const subscriber = await getSubscriber(admin, user.id, user.email);
      if (!subscriber?.is_pro) {
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        const { count } = await admin
          .from('generations').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id).gte('created_at', startOfDay.toISOString());
        if (count >= 1) {
          return NextResponse.json({ error: 'Rate limit reached', reason: 'daily_limit_reached' }, { status: 429 });
        }
      }
    } else {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const { count } = await admin
        .from('generations').select('*', { count: 'exact', head: true })
        .eq('ip_address', ip).gte('created_at', startOfDay.toISOString());
      if (count >= 1) {
        return NextResponse.json({ error: 'Rate limit reached', reason: 'daily_limit_reached' }, { status: 429 });
      }
    }

    const prompt = buildRefinementPrompt({ currentLetter, feedback, jobTitle, company, language });
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = getAnthropicClient().messages.stream({
            model: 'claude-sonnet-4-5',
            max_tokens: 1200,
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
    console.error('Refine error:', err);
    return NextResponse.json({ error: 'Failed to refine letter' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getAnthropicClient, buildCVPrompt } from '@/lib/anthropic';
import { supabaseAdmin } from '@/lib/supabase';

const FREE_LIMIT_PER_DAY = 1;
const EMAIL_BONUS_LIMIT = 3;

function getIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

async function checkRateLimit(ip, email) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const { count: ipCount, error } = await supabaseAdmin
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', startOfDay);

  if (error) throw new Error('Database error');

  if (ipCount >= FREE_LIMIT_PER_DAY) {
    if (email) {
      const { data: subscriber } = await supabaseAdmin
        .from('subscribers')
        .select('is_pro')
        .eq('email', email)
        .single();

      if (subscriber?.is_pro) return { allowed: true };

      const { count: emailCount } = await supabaseAdmin
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('email', email);

      if (emailCount < EMAIL_BONUS_LIMIT) return { allowed: true };
      return { allowed: false, reason: 'email_limit_reached' };
    }
    return { allowed: false, reason: 'daily_limit_reached' };
  }
  return { allowed: true };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rawText, targetRole, targetIndustry, language, email } = body;

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Please provide more detail about your background.' },
        { status: 400 }
      );
    }

    const ip = getIp(request);
    const { allowed, reason } = await checkRateLimit(ip, email);

    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit reached', reason }, { status: 429 });
    }

    const prompt = buildCVPrompt({ rawText, targetRole, targetIndustry, language });
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = getAnthropicClient().messages.stream({
            model: 'claude-sonnet-4-5',
            max_tokens: 2048,
            messages: [{ role: 'user', content: prompt }],
          });

          for await (const event of messageStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta?.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          await supabaseAdmin
            .from('generations')
            .insert({ ip_address: ip, email: email || null });
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('CV optimize error:', err);
    return NextResponse.json({ error: 'Failed to optimize CV' }, { status: 500 });
  }
}

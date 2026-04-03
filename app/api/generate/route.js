import { NextResponse } from 'next/server';
import { getAnthropicClient, buildCoverLetterPrompt } from '@/lib/anthropic';
import { createClient, getAdminClient } from '@/lib/supabase-server';

const FREE_LIMIT_PER_DAY = 1;

function getIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      jobTitle, company, jobDescription, background,
      tone, language, companyContext, senderName,
    } = body;

    if (!jobTitle || !company || !jobDescription || !background) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const admin = getAdminClient();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const ip = getIp(request);

    if (user) {
      // Check if Pro
      const { data: subscriber } = await admin
        .from('subscribers')
        .select('is_pro')
        .eq('user_id', user.id)
        .single();

      if (!subscriber?.is_pro) {
        // Authenticated but free: 1 per day by user_id
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count } = await admin
          .from('generations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString());

        if (count >= FREE_LIMIT_PER_DAY) {
          return NextResponse.json(
            { error: 'Rate limit reached', reason: 'daily_limit_reached' },
            { status: 429 }
          );
        }
      }
      // Pro → no limit check
    } else {
      // Anonymous: 1 per day by IP
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { count } = await admin
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', startOfDay.toISOString());

      if (count >= FREE_LIMIT_PER_DAY) {
        return NextResponse.json(
          { error: 'Rate limit reached', reason: 'daily_limit_reached' },
          { status: 429 }
        );
      }
    }

    const prompt = buildCoverLetterPrompt({
      jobTitle, company, jobDescription, background,
      tone: tone?.toLowerCase() || 'professional',
      language: language || 'English',
      companyContext: companyContext || null,
      senderName: senderName || null,
    });

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
            if (
              event.type === 'content_block_delta' &&
              event.delta?.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          await admin.from('generations').insert({
            ip_address: ip,
            user_id: user?.id || null,
          });
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
    console.error('Generate error:', err);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}

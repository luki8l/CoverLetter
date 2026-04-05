import { NextResponse } from 'next/server';
import { getAnthropicClient, buildCoverLetterPrompt } from '@/lib/anthropic';
import { createClient, getAdminClient } from '@/lib/supabase-server';
import { sendWelcomeEmail, sendLimitReachedEmail } from '@/lib/email';

const ANON_LIMIT = 1;        // IP-based, no account
const FREE_USER_LIMIT = 2;   // logged-in free account (clearly better than anonymous — creates upgrade pressure at 2)

function getIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

async function getSubscriber(admin, userId, email) {
  // Try by user_id first
  if (userId) {
    const { data } = await admin
      .from('subscribers')
      .select('is_pro, user_id')
      .eq('user_id', userId)
      .single();
    if (data) return data;
  }
  // Fallback: match by email (e.g. bought before logging in)
  if (email) {
    const { data } = await admin
      .from('subscribers')
      .select('is_pro, user_id')
      .eq('email', email)
      .single();
    // Link user_id retroactively so future lookups are fast
    if (data && userId && !data.user_id) {
      await admin
        .from('subscribers')
        .update({ user_id: userId })
        .eq('email', email);
    }
    return data;
  }
  return null;
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
    let isFirstGeneration = false;

    if (user) {
      const subscriber = await getSubscriber(admin, user.id, user.email);

      if (!subscriber?.is_pro) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count } = await admin
          .from('generations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString());

        if (count >= FREE_USER_LIMIT) {
          // Fire-and-forget limit-reached email (high-intent conversion moment)
          sendLimitReachedEmail({ email: user.email }).catch(() => {});
          return NextResponse.json(
            { error: 'Rate limit reached', reason: 'daily_limit_reached' },
            { status: 429 }
          );
        }

        // Track first-ever generation for welcome email
        if (count === 0) {
          const { count: totalCount } = await admin
            .from('generations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          isFirstGeneration = (totalCount === 0);
        }
      }
    } else {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { count } = await admin
        .from('generations')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', startOfDay.toISOString());

      if (count >= ANON_LIMIT) {
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
          // Welcome email on first ever generation for logged-in users
          if (isFirstGeneration && user) {
            sendWelcomeEmail({ email: user.email }).catch(() => {});
          }
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

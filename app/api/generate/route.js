import { NextResponse } from 'next/server';
import { anthropic, buildCoverLetterPrompt } from '@/lib/anthropic';
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

  const { count: ipCount, error: ipError } = await supabaseAdmin
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', startOfDay);

  if (ipError) throw new Error('Database error checking rate limit');

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
    const {
      jobTitle, company, jobDescription, background,
      tone, language, email,
      // Optional enrichment fields
      companyContext, senderName, senderCity,
    } = body;

    if (!jobTitle || !company || !jobDescription || !background) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ip = getIp(request);
    const { allowed, reason } = await checkRateLimit(ip, email);

    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit reached', reason }, { status: 429 });
    }

    const prompt = buildCoverLetterPrompt({
      jobTitle,
      company,
      jobDescription,
      background,
      tone: tone?.toLowerCase() || 'professional',
      language: language || 'English',
      companyContext: companyContext || null,
      senderName: senderName || null,
      senderCity: senderCity || null,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const coverLetter = message.content[0].text.trim();

    await supabaseAdmin
      .from('generations')
      .insert({ ip_address: ip, email: email || null });

    return NextResponse.json({ coverLetter });
  } catch (err) {
    console.error('Generate error:', err);
    if (err.status === 429) {
      return NextResponse.json({ error: 'AI service busy, try again shortly' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getAnthropicClient, buildInterviewPrompt } from '@/lib/anthropic';

export async function POST(request) {
  try {
    const { jobTitle, company, jobDescription, background, coverLetter } = await request.json();

    if (!jobDescription?.trim() || !background?.trim()) {
      return NextResponse.json({ error: 'Job description and background are required.' }, { status: 400 });
    }

    const prompt = buildInterviewPrompt({ jobTitle, company, jobDescription, background, coverLetter });

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0]?.text?.trim() || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const data = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Invalid response shape');
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Interview prep error:', err);
    return NextResponse.json({ error: 'Interview prep failed. Please try again.' }, { status: 500 });
  }
}

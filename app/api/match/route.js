import { NextResponse } from 'next/server';
import { getAnthropicClient, buildMatchPrompt } from '@/lib/anthropic';

export async function POST(request) {
  try {
    const { jobTitle, company, jobDescription, background } = await request.json();

    if (!jobDescription?.trim() || !background?.trim()) {
      return NextResponse.json({ error: 'Job description and background are required.' }, { status: 400 });
    }

    const prompt = buildMatchPrompt({ jobTitle, company, jobDescription, background });

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0]?.text?.trim() || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const data = JSON.parse(jsonMatch[0]);

    // Validate shape
    if (typeof data.score !== 'number' || !Array.isArray(data.strengths) || !Array.isArray(data.gaps)) {
      throw new Error('Invalid response shape');
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Match analysis error:', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}

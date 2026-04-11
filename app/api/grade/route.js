import { NextResponse } from 'next/server';
import { getAnthropicClient, buildGradePrompt } from '@/lib/anthropic';

export async function POST(request) {
  try {
    const { coverLetter, jobDescription, jobTitle, company } = await request.json();

    if (!coverLetter?.trim()) {
      return NextResponse.json({ error: 'Cover letter is required.' }, { status: 400 });
    }

    const prompt = buildGradePrompt({ coverLetter, jobDescription, jobTitle, company });

    const message = await getAnthropicClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0]?.text?.trim() || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const data = JSON.parse(jsonMatch[0]);

    if (typeof data.total !== 'number' || typeof data.hook !== 'number') {
      throw new Error('Invalid response shape');
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Grade error:', err);
    return NextResponse.json({ error: 'Grading failed. Please try again.' }, { status: 500 });
  }
}

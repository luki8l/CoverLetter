import { NextResponse } from 'next/server';
import { getAnthropicClient, buildResignationPrompt } from '@/lib/anthropic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, yourName, managerName, company, role, lastDay, reason, highlights, tone, language } = body;

    if (!company?.trim()) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }

    const prompt = buildResignationPrompt({ type, yourName, managerName, company, role, lastDay, reason, highlights, tone, language });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = getAnthropicClient().messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 600,
            messages: [{ role: 'user', content: prompt }],
          });
          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
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
    console.error('Resignation error:', err);
    return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 });
  }
}

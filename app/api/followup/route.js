import { getAnthropicClient, buildFollowUpPrompt } from '@/lib/anthropic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, company, jobTitle, interviewerName, discussedTopics, appliedDate, language } = body;

    if (!company?.trim() || !jobTitle?.trim()) {
      return new Response(JSON.stringify({ error: 'Company and job title are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildFollowUpPrompt({ type, company, jobTitle, interviewerName, discussedTopics, appliedDate, language });

    const stream = await getAnthropicClient().messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (err) {
    console.error('Follow-up email error:', err);
    return new Response(JSON.stringify({ error: 'Generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

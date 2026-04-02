import { NextResponse } from 'next/server';
import { getAnthropicClient } from '@/lib/anthropic';

// Strip HTML to readable plain text
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<\/(p|div|li|h[1-6]|section|article|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Valid URL required' }, { status: 400 });
    }

    // Fetch the page with browser-like headers to avoid basic bot blocks
    let html;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Could not fetch the page (${res.status}). Try pasting the job description directly.` },
          { status: 422 }
        );
      }

      html = await res.text();
    } catch {
      return NextResponse.json(
        { error: 'Could not reach that URL. The site may block automated requests — paste the job description manually.' },
        { status: 422 }
      );
    }

    const rawText = htmlToText(html);

    if (rawText.length < 200) {
      return NextResponse.json(
        { error: 'Page has too little readable content. Try pasting the job description manually.' },
        { status: 422 }
      );
    }

    // Limit text to keep token usage reasonable
    const truncated = rawText.slice(0, 8000);

    // Use Claude to extract structured job data from the raw text
    const client = getAnthropicClient();
    const extraction = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Extract structured job information from this job posting text. Output ONLY valid JSON, nothing else.

Required fields:
{
  "jobTitle": "exact job title as written",
  "company": "company name",
  "jobDescription": "the full job description — responsibilities, requirements, nice-to-haves, everything about the role. Keep it comprehensive.",
  "companyContext": "2-3 sentences about the company: what they do, mission, size, product, notable facts — only include what is actually stated in the text",
  "location": "city, country or 'Remote' if mentioned, or null",
  "employmentType": "Full-time / Part-time / Contract / Internship or null"
}

If a field cannot be found, use null. Do not invent information.

Job posting text:
${truncated}`,
        },
      ],
    });

    let parsed;
    try {
      const raw = extraction.content[0].text.trim();
      // Strip markdown code fences if Claude wrapped it
      const jsonStr = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: 'Could not parse job details. Try pasting the description manually.' },
        { status: 422 }
      );
    }

    if (!parsed.jobTitle && !parsed.jobDescription) {
      return NextResponse.json(
        { error: 'Could not find job details on this page. Try pasting the job description manually.' },
        { status: 422 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Scrape job error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch job details. Paste the job description manually.' },
      { status: 500 }
    );
  }
}

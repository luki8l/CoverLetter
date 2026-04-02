import Anthropic from '@anthropic-ai/sdk';

let _client = null;

export function getAnthropicClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export const anthropic = new Proxy({}, {
  get(_, prop) {
    return getAnthropicClient()[prop];
  },
});

// Shared anti-AI-tone rules injected into every prompt
const HUMAN_TONE_RULES = `
CRITICAL — tone and style rules (never break these):
- Write like a smart, specific human — not an AI completing a template.
- Vary sentence length intentionally. Short punchy ones. Then occasionally a longer one that earns its length.
- Never use: "In today's competitive landscape", "I am passionate about", "dedicated professional", "results-driven", "I thrive in", "fast-paced environment", "dynamic", "synergy", "leverage", "I am excited to", "I would love the opportunity", "I believe I would be a great fit", "I look forward to hearing from you", "I am writing to apply".
- Do NOT stack adjectives before nouns. One precise word beats three vague ones.
- Use concrete specifics — numbers, names, actual outputs — never vague claims.
- Don't mirror the job description language back verbatim. Interpret it, don't echo it.
- Every sentence must add information. Cut anything that only fills space.
- The reader should not be able to tell this was AI-generated.`;

export function buildCoverLetterPrompt({ jobTitle, company, jobDescription, background, tone, language }) {
  const toneGuide = {
    professional: 'Confident and direct. No warmth padding, no unnecessary pleasantries. Get to the point fast.',
    enthusiastic: 'Genuine energy — but earned, not performed. Express real interest through specifics, not adjectives.',
    creative: 'Memorable opening, a distinct voice. Break the formula where it helps. Still professional enough to be taken seriously.',
  };

  const lang = language === 'Deutsch'
    ? 'Write entirely in German (Deutsch). Use natural, modern German — not overly formal Amtssprache.'
    : 'Write in English.';

  return `You are writing a cover letter for a job application. Your goal: a letter that gets read in full and results in an interview request.
${HUMAN_TONE_RULES}

Tone: ${toneGuide[tone?.toLowerCase()] || toneGuide.professional}
Language: ${lang}

--- INPUT ---
Job Title: ${jobTitle}
Company: ${company}

Job Description:
${jobDescription}

Candidate Background:
${background}
--- END INPUT ---

Structure:
1. Opening paragraph — start with a hook specific to this company or role. Not "I am writing to apply." Reference something real about the company or the challenge the role solves.
2. One or two body paragraphs — connect the candidate's most relevant experience directly to 2-3 specific requirements from the job description. Use concrete results where possible.
3. Closing paragraph — confident and specific call to action. Not passive. Not "I look forward to hearing from you."

Constraints:
- Under 350 words total.
- No bullet points.
- No subject line.
- Address the letter to ${company}.
- Output only the letter text. Nothing else.`;
}

export function buildCVPrompt({ rawText, targetRole, targetIndustry, language }) {
  const lang = language === 'Deutsch'
    ? 'Write the entire CV in German (Deutsch). Use natural, modern German.'
    : 'Write in English.';

  const targetContext = targetRole || targetIndustry
    ? `The candidate is targeting: ${[targetRole, targetIndustry].filter(Boolean).join(', ')}.
Optimize keyword density and section emphasis for this target. Naturally integrate relevant ATS keywords for this role — don't force them, but make sure they appear in context.`
    : 'Optimize for general professional roles based on the candidate\'s background.';

  return `You are a professional CV writer and career coach. Transform the unstructured input below into a clean, ATS-optimized CV that still reads like a real human wrote it.
${HUMAN_TONE_RULES}

${lang}
${targetContext}

--- UNSTRUCTURED INPUT ---
${rawText}
--- END INPUT ---

Output a CV in this exact structure (plain text, no markdown symbols like ** or ##):

[Full Name]
[Email] | [Phone] | [Location] | [LinkedIn if present]

SUMMARY
Two to three sentences. First person, present tense. Specific about what the person does and what makes them good at it. No buzzwords. No "dedicated professional." Sound like a real person describing themselves confidently.

EXPERIENCE
[Company Name] | [Job Title] | [Start – End]
- [Achievement or responsibility — start with a varied action verb, quantify where the input gives you anything to work with]
- [Achievement or responsibility]
- [Achievement or responsibility]
(repeat for each role)

SKILLS
[Group skills naturally — e.g. "Languages: Python, SQL, JavaScript" or "Tools: Figma, Jira, Notion" — only list what appears in the input or can be reasonably inferred from it]

EDUCATION
[Degree] | [Institution] | [Year]
[Certification or course if relevant]

Rules for the CV content:
- If the input is missing dates or details, use reasonable placeholders like [Year] rather than inventing specifics.
- Vary the action verbs across bullet points — don't start every line with "Led" or "Managed."
- Keep bullet points between one and two lines. No padding.
- The summary must not sound like a template. Read it back — if it could apply to any professional in any industry, rewrite it.
- ATS keywords should appear in context (inside sentences/bullets), not stuffed in a keyword list.
- If the input mentions numbers, metrics, or results — use them. If not, phrase achievements in terms of outcomes rather than tasks.

Output only the CV text. No preamble, no explanation, no "Here is your CV:".`;
}

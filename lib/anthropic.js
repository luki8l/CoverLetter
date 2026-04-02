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

export function buildPrompt({ jobTitle, company, jobDescription, background, tone, language }) {
  const toneInstructions = {
    professional: 'formal, confident, and business-appropriate tone. Use precise language that demonstrates expertise.',
    enthusiastic: 'warm, energetic, and genuinely excited tone. Show authentic passion for the role and company.',
    creative: 'distinctive, memorable, and original tone. Break convention where appropriate while staying professional.',
  };

  const languageInstruction = language === 'Deutsch'
    ? 'Write the cover letter in German (Deutsch).'
    : 'Write the cover letter in English.';

  return `You are an expert cover letter writer. Write a compelling, personalized cover letter based on the details below.

Job Title: ${jobTitle}
Company: ${company}

Job Description:
${jobDescription}

Candidate Background:
${background}

Instructions:
- ${languageInstruction}
- Use a ${toneInstructions[tone] || toneInstructions.professional}
- Keep it under 350 words total.
- Do NOT start with "I am writing to apply for..." or any generic opener. Start with a strong, specific hook that references something compelling about the role or company.
- Reference 2-3 specific details from the job description to show you read it carefully.
- Highlight the most relevant parts of the candidate's background for this specific role.
- Do NOT use filler phrases like "I believe I would be a great fit", "I am passionate about", "I am excited to", or "I would love the opportunity".
- End with a confident, specific call to action — not a passive "I look forward to hearing from you."
- Format: opening paragraph, 1-2 body paragraphs, closing paragraph. No bullet points. No subject line. No "Dear Hiring Manager" unless the company name is not given.
- Address the letter to ${company}.

Output only the cover letter text itself. No preamble, no explanation, no formatting markers.`;
}

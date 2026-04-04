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

// ─── Shared tone rules injected into every prompt ───────────────────────────
const HUMAN_TONE_RULES = `
CRITICAL — writing style (never break these):
- Write like a specific, intelligent human — not an AI filling a template.
- Vary sentence length deliberately. Short ones land hard. Longer ones carry context when needed.
- Banned phrases (instant disqualification): "In today's competitive landscape", "I am passionate about", "dedicated professional", "results-driven", "I thrive in", "fast-paced environment", "dynamic", "synergy", "leverage", "I am excited to", "I would love the opportunity", "I believe I would be a great fit", "I look forward to hearing from you", "I am writing to apply", "unique opportunity", "go above and beyond", "team player", "self-starter", "detail-oriented".
- No adjective stacking. One precise word beats three vague ones.
- Every sentence must add new information. No filler.
- Specifics > generics. Numbers, names, real outputs, actual technologies.
- The reader must not be able to tell this was written by AI.`;

// ─── Cover Letter ────────────────────────────────────────────────────────────
export function buildCoverLetterPrompt({
  jobTitle,
  company,
  jobDescription,
  background,
  tone,
  language,
  companyContext,
  senderName,
}) {
  const toneGuide = {
    professional:
      'Confident, direct, substantive. Cut to the point fast. No warmth-padding or pleasantries.',
    enthusiastic:
      'Genuine energy — earned through specifics, not adjectives. Express real interest by referencing actual things about the company.',
    creative:
      'Memorable, distinct voice. Subvert the standard opening. Still professional enough to be taken seriously.',
  };

  const lang =
    language === 'Deutsch'
      ? 'Write entirely in German. Use natural, modern German — not stiff bureaucratic prose. For German letters: use "Sehr geehrte Damen und Herren," only if no name is available, otherwise address the hiring team directly.'
      : 'Write in English.';

  const companySection = companyContext
    ? `\nCompany context (use this to show you know the company — weave it in naturally, don't just repeat it back):\n${companyContext}`
    : '';

  const closingName = senderName ? senderName : '[Your Name]';

  return `You are writing a cover letter. Goal: a letter that gets read in full, triggers an interview request, and passes ATS screening.
${HUMAN_TONE_RULES}

Tone: ${toneGuide[tone?.toLowerCase()] || toneGuide.professional}
Language: ${lang}

--- JOB DETAILS ---
Job Title: ${jobTitle}
Company: ${company}${companySection}

Job Description:
${jobDescription}

--- CANDIDATE BACKGROUND ---
${background}
--- END ---

Output format — write the complete letter in this exact structure:

Dear [specific salutation — e.g. "Dear ${company} Team," or "Dear Hiring Team," — never generic "To Whom It May Concern"],

[Opening paragraph: Start with a hook specific to this company or this role. Reference something real — a product, a challenge the role solves, a company milestone, what makes this role different. NOT "I am writing to apply." 2-4 sentences.]

[Body paragraph 1: Most relevant experience for this specific role. Reference 1-2 concrete requirements from the job description and match them to specific things from the candidate's background. Use numbers/results where the background provides them.]

[Body paragraph 2 (if needed): Second strongest angle — a skill, project, or context that differentiates this candidate. Keep tight.]

[Closing paragraph: Confident, specific call to action. Something like proposing a conversation about X, or mentioning availability. NOT "I look forward to hearing from you."]

${language === 'Deutsch' ? 'Mit freundlichen Grüßen,' : 'Best regards,'}
${closingName}

ATS REQUIREMENTS — non-negotiable:
- The exact company name "${company}" MUST appear verbatim at least once in the letter body (not just the salutation). Write it out in full.
- The job title "${jobTitle}" MUST appear verbatim at least once in the letter body.
- Failure to include either means the letter fails ATS screening before a human ever reads it.

Constraints:
- 280–360 words total (including salutation and sign-off).
- No bullet points anywhere in the letter.
- Output only the letter. Nothing else — no "Here is your cover letter:", no notes.`;
}

// ─── Cover Letter Refinement ─────────────────────────────────────────────────
export function buildRefinementPrompt({ currentLetter, feedback, jobTitle, company, language }) {
  const lang = language === 'Deutsch' ? 'Keep the letter in German.' : 'Keep the letter in English.';
  return `You wrote this cover letter. The candidate has specific feedback. Apply it precisely and return the improved version.

CURRENT LETTER:
${currentLetter}

FEEDBACK TO APPLY:
${feedback}

${HUMAN_TONE_RULES}

RULES:
- Apply ONLY what the feedback asks for. Keep everything else as close to the original as possible.
- The company name "${company}" must appear verbatim in the letter body.
- The job title "${jobTitle}" must appear verbatim in the letter body.
- 280–380 words total. No bullet points.
- ${lang}
- Output ONLY the revised letter. No preamble, no explanations.`;
}

// ─── Job Match Analyzer ──────────────────────────────────────────────────────
export function buildMatchPrompt({ jobTitle, company, jobDescription, background }) {
  return `You are a senior recruiter and career coach. Analyze how well this candidate fits this job. Be honest and specific — not generic.

--- JOB ---
Title: ${jobTitle}
Company: ${company}
Description:
${jobDescription}

--- CANDIDATE BACKGROUND ---
${background}
--- END ---

Return ONLY valid JSON — no markdown, no explanation, no code fences:
{
  "score": <integer 0-100, realistic match score>,
  "strengths": [<3-4 specific strengths from their background that directly match JD requirements — quote actual skills/experience, not vague praise>],
  "gaps": [<2-3 honest gaps or risks — things the JD asks for that are absent or thin in the background — if genuinely strong fit, still name the hardest questions they'll face>],
  "angle": "<one punchy sentence: the exact positioning strategy this candidate should use — what to lead with, what unique angle makes them stand out for THIS specific role>"
}

Score guide: 85-100 = strong match (rare), 70-84 = good fit, 55-69 = possible but needs framing, below 55 = significant gaps. Be calibrated — most applicants score 55-78.`;
}

// ─── Interview Prep ───────────────────────────────────────────────────────────
export function buildInterviewPrompt({ jobTitle, company, jobDescription, background, coverLetter }) {
  // Trim inputs to prevent excessively long prompts that eat into response budget
  const jd = jobDescription?.slice(0, 3000) || '';
  const bg = background?.slice(0, 2000) || '';
  const letterContext = coverLetter
    ? `\n--- THEIR COVER LETTER ---\n${coverLetter.slice(0, 1500)}\n--- END ---\n`
    : '';

  return `You are a senior interviewer at ${company}. Generate 5 highly specific interview questions for this candidate applying for the ${jobTitle} role. Mix behavioral, technical, situational, motivation, and one tough/gap question.

--- JOB DESCRIPTION ---
${jd}

--- CANDIDATE BACKGROUND ---
${bg}
--- END ---
${letterContext}
Make questions specific to THEIR background and THIS role — not generic. Reference actual things from their CV and the JD.

Return ONLY valid JSON — no markdown, no code fences:
{
  "questions": [
    {
      "type": "<Behavioral|Technical|Situational|Motivation|Challenge>",
      "question": "<the exact interview question — specific, not generic>",
      "why": "<one sentence: what the interviewer is actually evaluating with this question>",
      "framework": ["<step 1: what to include in your answer>", "<step 2>", "<step 3: how to close strong>"]
    }
  ]
}

Question type distribution: 1 Behavioral, 1 Technical (or skills-based), 1 Situational, 1 Motivation, 1 Challenge (addresses a potential gap or tough topic from their background vs the JD).`;
}

// ─── CV Optimizer ────────────────────────────────────────────────────────────
export function buildCVPrompt({ rawText, targetRole, targetIndustry, language }) {
  const lang =
    language === 'Deutsch'
      ? 'Write the entire CV in German. Use natural, modern German.'
      : 'Write in English.';

  const targetContext =
    targetRole || targetIndustry
      ? `Target: ${[targetRole, targetIndustry].filter(Boolean).join(', ')}. Optimize keyword density and framing for this target. Naturally integrate relevant ATS keywords — in context, not as a stuffed list.`
      : 'Optimize for general professional roles based on the candidate\'s background.';

  return `You are a senior CV writer and career strategist. Transform unstructured input into a clean, ATS-optimized CV that reads like a human wrote it.
${HUMAN_TONE_RULES}

${lang}
${targetContext}

--- UNSTRUCTURED INPUT ---
${rawText}
--- END ---

Output a CV in this structure (plain text, NO markdown symbols like ** or ##):

[Full Name]
[Email] | [Phone] | [Location] | [LinkedIn if present]

SUMMARY
2-3 sentences. First person. Specific about what this person does and what makes them effective at it. No buzzwords. Sound like a confident human describing themselves, not an AI writing a template. If it could apply to any professional anywhere, it's wrong — rewrite it.

EXPERIENCE

[Company Name] | [Job Title] | [Month Year – Month Year]
- [Achievement/responsibility — varied action verb, quantify where input gives you material]
- [Achievement/responsibility]
- [Achievement/responsibility]

(repeat for each role, most recent first)

SKILLS
[Group naturally: e.g., "Languages: Python, SQL, Go" / "Tools: Figma, Jira, dbt" — only list what the input mentions or strongly implies]

EDUCATION
[Degree] | [Institution] | [Year]

Rules:
- If input is missing dates, use [Year] as placeholder rather than inventing.
- Vary action verbs — not every bullet starting with "Led" or "Managed" or "Developed".
- Bullet points: 1–2 lines max. No padding.
- ATS keywords appear in the body of bullets and summary — not in a keyword dump section.
- Use metrics from the input. If none given, describe outcomes not just tasks.
- Output only the CV. No preamble.`;
}

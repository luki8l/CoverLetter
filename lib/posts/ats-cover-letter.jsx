export const meta = {
  slug: 'ats-cover-letter',
  title: 'How to Write an ATS-Friendly Cover Letter (Without Sounding Like a Robot)',
  description:
    'ATS software screens your cover letter before any human reads it. Here is exactly how to pass the filter while still writing something a recruiter will want to read.',
  date: '2025-04-08',
  readTime: '5 min read',
  keywords: ['ats cover letter', 'ats friendly cover letter', 'applicant tracking system cover letter', 'ats optimized cover letter'],
};

export default function Post() {
  return (
    <>
      <p>
        Most large companies — and a growing number of smaller ones — run job applications through an Applicant
        Tracking System (ATS) before a recruiter sees them. Your cover letter is scanned, parsed, and scored. If
        it does not contain the right signals, it gets filtered out before any human reads it.
      </p>
      <p>
        The good news: writing an ATS-friendly cover letter does not mean stuffing in keywords or writing like a
        machine. It means being specific and intentional with language you would use anyway.
      </p>

      <h2>What ATS Software Actually Checks</h2>
      <p>Modern ATS tools look for several things in a cover letter:</p>
      <ul>
        <li><strong>Keyword matches.</strong> Skills, tools, and role-specific terms from the job description.</li>
        <li><strong>Job title alignment.</strong> Whether you have held a role similar to the one you are applying for.</li>
        <li><strong>Formatting.</strong> Many ATS systems struggle with tables, columns, text boxes, and unusual fonts. Plain, single-column text parses better.</li>
        <li><strong>Relevance signals.</strong> Mentions of the company name, the specific role, and industry-relevant terminology.</li>
      </ul>

      <h2>How to Optimise Without Keyword Stuffing</h2>
      <h3>Mirror the job description language</h3>
      <p>
        If the job post says &ldquo;stakeholder management,&rdquo; use that phrase — not &ldquo;working with internal teams.&rdquo; If
        they say &ldquo;data-driven decision making,&rdquo; use that exact phrase somewhere in your letter. ATS systems
        are literal; synonyms often do not match.
      </p>
      <p>
        Read the job description carefully and note the specific words and phrases they repeat. Those are your priority
        keywords. Work them into sentences naturally, in context.
      </p>

      <h3>Use the exact job title</h3>
      <p>
        Include the job title you are applying for somewhere in your first paragraph. &ldquo;I am applying for the Senior
        Product Manager role&rdquo; is a direct signal that is easy for ATS to pick up.
      </p>

      <h3>Keep formatting simple</h3>
      <p>
        Standard paragraph text. No columns. No tables. No text boxes or decorative elements if you are submitting
        as a PDF (some ATS systems convert to plain text internally, and complex layouts become garbled).
      </p>
      <p>
        Headers like &ldquo;Dear Hiring Manager&rdquo; and a standard sign-off are fine — they are expected and help with
        parsing.
      </p>

      <h2>The Keywords That Matter Most</h2>
      <p>Focus on three categories from the job description:</p>
      <ul>
        <li><strong>Hard skills.</strong> Specific tools, technologies, methodologies. If they list Salesforce, Figma, SQL, or Python — and you have used them — they go in your letter.</li>
        <li><strong>Soft skills they name explicitly.</strong> If they say &ldquo;cross-functional collaboration&rdquo; three times, that phrase matters to them.</li>
        <li><strong>Industry terminology.</strong> B2B, SaaS, FMCG, fintech — whatever vertical they are in, use their language.</li>
      </ul>

      <h2>What Does Not Help (And Can Hurt)</h2>
      <ul>
        <li>Repeating the same keyword five times in one paragraph.</li>
        <li>Including keywords that do not reflect your actual experience — you will be found out in the interview.</li>
        <li>Unusual file formats. Submit PDF unless they specifically ask for Word.</li>
        <li>Headers and footers with your contact info in text boxes — some ATS systems cannot read these.</li>
      </ul>

      <h2>The Fast Way to Get This Right</h2>
      <p>
        Reading a job description, identifying the key terms, and weaving them naturally into a cover letter takes
        practice and time. <a href="/generate">CoverDraft</a> does this analysis automatically — it reads the job
        post, identifies the keywords that matter, and writes a letter that includes them in context.
      </p>
      <p>
        The job fit score tells you exactly how well your background matches the role before you even start writing —
        so you know which skills to emphasise and which gaps you might need to address.
      </p>
    </>
  );
}

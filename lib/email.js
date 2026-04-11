import { Resend } from 'resend';

let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = 'CoverDraft <hello@coverdraft.app>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://coverdraft.app';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wrapHtml(content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; color: #111827; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { background: #4f46e5; padding: 28px 32px; }
    .header-logo { color: #fff; font-weight: 700; font-size: 18px; text-decoration: none; letter-spacing: -0.3px; }
    .body { padding: 32px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #111827; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.7; color: #374151; margin: 0 0 16px; }
    .cta { display: inline-block; background: #4f46e5; color: #fff !important; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none; margin: 8px 0 24px; }
    .feature-list { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
    .feature-item { font-size: 14px; color: #374151; padding: 4px 0; }
    .feature-item::before { content: "✓ "; color: #10b981; font-weight: 700; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
    .footer { padding: 20px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0; }
    .footer a { color: #6b7280; }
    .highlight { color: #4f46e5; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${APP_URL}" class="header-logo">CoverDraft</a>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>You're receiving this because you signed up at <a href="${APP_URL}">coverdraft.app</a>.</p>
    </div>
  </div>
</body>
</html>`;
}

async function send({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set — skipping email to', to);
    return;
  }
  try {
    const { error } = await getResend().emails.send({ from: FROM, to, subject, html });
    if (error) console.error('[email] Send error:', error);
  } catch (err) {
    console.error('[email] Exception:', err);
  }
}

// ─── Email templates ─────────────────────────────────────────────────────────

/**
 * Sent when a logged-in user generates their very first letter.
 */
export async function sendWelcomeEmail({ email, firstName }) {
  const name = firstName || 'there';
  await send({
    to: email,
    subject: 'Your first cover letter is ready — here\'s how to get even more from CoverDraft',
    html: wrapHtml(`
      <h1>Nice work, ${name}! 👋</h1>
      <p>Your first cover letter is ready. But that's just the start of what CoverDraft can do for your job hunt.</p>

      <div class="feature-list">
        <div class="feature-item">Analyze your job fit — match score + strengths/gaps (free)</div>
        <div class="feature-item">Prep for the interview — 5 predicted questions with frameworks</div>
        <div class="feature-item">Write the perfect follow-up email — application, thank-you, rejection</div>
        <div class="feature-item">Track all your applications — status, notes, one click to re-open</div>
      </div>

      <p>You have <span class="highlight">2 free letters per day</span>. Applying to more? Upgrade to Pro for unlimited generations + the full toolkit.</p>

      <a href="${APP_URL}/generate" class="cta">Generate another letter →</a>

      <hr class="divider" />
      <p style="font-size:13px; color:#6b7280;">Quick tip: paste the job URL at the top of the generator — it auto-fills the title, company, and description for you. Saves 5 minutes per application.</p>
    `),
  });
}

/**
 * Sent when a free user hits their daily generation limit.
 * High-intent moment — this email converts well.
 */
export async function sendLimitReachedEmail({ email, checkoutUrl }) {
  const upgradeLink = checkoutUrl || `${APP_URL}/pricing`;
  await send({
    to: email,
    subject: `You've hit your daily limit — unlock unlimited for €9`,
    html: wrapHtml(`
      <h1>You've used both free letters today</h1>
      <p>Still have applications to write? <span class="highlight">Upgrade to Pro</span> and remove the limit — forever.</p>

      <div class="feature-list">
        <div class="feature-item">Unlimited cover letters — no daily cap</div>
        <div class="feature-item">Letter Strategy tip — the exact angle to lead with per role</div>
        <div class="feature-item">All 5 interview questions (free plan shows 2)</div>
        <div class="feature-item">Unlimited CV optimizations</div>
      </div>

      <p style="font-size:14px; color:#6b7280; margin-bottom:8px;">One-time setup, cancel anytime. Most users land an interview within their first 10 applications.</p>

      <a href="${upgradeLink}" class="cta">Upgrade to Pro — €9/month →</a>

      <hr class="divider" />
      <p style="font-size:13px; color:#6b7280;">Your limit resets tomorrow morning. If you can wait — your letters will still be there.</p>
    `),
  });
}

/**
 * Sent 3 days after signup if user is still on free plan.
 * Triggered via /api/admin/campaigns (manual or cron).
 */
export async function sendDay3NurtureEmail({ email }) {
  await send({
    to: email,
    subject: 'The interview thank-you email most people skip (and why it matters)',
    html: wrapHtml(`
      <h1>This email gets more offers than the cover letter</h1>
      <p>Research shows hiring managers factor in thank-you notes — but most candidates send either nothing or a generic "Thanks for your time."</p>
      <p>CoverDraft generates a specific, personal thank-you email based on:</p>

      <div class="feature-list">
        <div class="feature-item">The interviewer's name</div>
        <div class="feature-item">Topics you discussed (you provide 2-3 bullet points)</div>
        <div class="feature-item">The specific role and company</div>
      </div>

      <p>It takes 30 seconds. And it's completely free.</p>

      <a href="${APP_URL}/followup?type=thank-you" class="cta">Write a thank-you email →</a>

      <hr class="divider" />
      <p style="font-size:13px; color:#6b7280;">
        While you're at it — if you're active in your job search, <a href="${APP_URL}/pricing" style="color:#4f46e5; font-weight:600;">Pro gives you unlimited letters</a> + the full interview prep suite for €9/month.
      </p>
    `),
  });
}

/**
 * Sent 7 days after signup if user is still on free plan.
 */
export async function sendDay7NurtureEmail({ email }) {
  await send({
    to: email,
    subject: 'What Pro users see that free users don\'t',
    html: wrapHtml(`
      <h1>Here's what you're missing on the free plan</h1>
      <p>Every time you analyze your job fit, there's a section at the bottom that's blurred out — your <span class="highlight">Letter Strategy</span>.</p>
      <p>It's a single sentence, generated from your CV vs. the job description, that tells you:</p>
      <p style="background:#f0f0ff; border-left:3px solid #4f46e5; padding:12px 16px; border-radius:8px; font-style:italic; color:#374151;">
        "Lead with your 3 years at [Company X] — their JD is asking for exactly what you did there, and no other applicant will have it."
      </p>
      <p>That's the difference between a letter that gets opened and one that doesn't. Pro users see it. Free users don't.</p>

      <div class="feature-list">
        <div class="feature-item">Letter Strategy — per-role positioning tip</div>
        <div class="feature-item">All 5 interview prep questions (vs 2 on free)</div>
        <div class="feature-item">Unlimited cover letters + CV optimizations</div>
      </div>

      <a href="${APP_URL}/pricing" class="cta">Unlock Pro — €9/month →</a>

      <hr class="divider" />
      <p style="font-size:13px; color:#6b7280;">Cancel anytime from your account page. No questions asked.</p>
    `),
  });
}

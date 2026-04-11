import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-server';
import { sendDay3NurtureEmail, sendDay7NurtureEmail } from '@/lib/email';

// Simple secret-key protection — set ADMIN_SECRET in your env
function isAuthorized(request) {
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${process.env.ADMIN_SECRET}`;
}

// POST /api/admin/campaigns
// Body: { campaign: 'day3' | 'day7', dryRun?: boolean }
//
// Run manually or via a cron job (e.g. Vercel Cron, GitHub Actions, etc.)
// Example cron: every day at 9am, send day3 to users who signed up 3 days ago
export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { campaign, dryRun = false } = await request.json();
  if (!['day3', 'day7'].includes(campaign)) {
    return NextResponse.json({ error: 'Invalid campaign. Use: day3, day7' }, { status: 400 });
  }

  const admin = getAdminClient();

  // Find free users (no is_pro subscription) who signed up N days ago
  const daysAgo = campaign === 'day3' ? 3 : 7;
  const from = new Date();
  from.setDate(from.getDate() - daysAgo);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setHours(23, 59, 59, 999);

  // Get users from auth.users who signed up on that date
  // and are NOT in subscribers (not Pro)
  const { data: users, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  const targetUsers = users.users.filter(u => {
    const created = new Date(u.created_at);
    return created >= from && created <= to;
  });

  // Filter out Pro subscribers
  const proEmails = new Set();
  if (targetUsers.length > 0) {
    const { data: proSubs } = await admin
      .from('subscribers')
      .select('email')
      .eq('is_pro', true)
      .in('email', targetUsers.map(u => u.email));
    proSubs?.forEach(s => proEmails.add(s.email));
  }

  const recipients = targetUsers.filter(u => !proEmails.has(u.email));

  if (dryRun) {
    return NextResponse.json({
      campaign,
      dryRun: true,
      targetCount: recipients.length,
      emails: recipients.map(u => u.email),
    });
  }

  // Send emails
  const results = { sent: 0, failed: 0, errors: [] };
  for (const u of recipients) {
    try {
      if (campaign === 'day3') await sendDay3NurtureEmail({ email: u.email });
      if (campaign === 'day7') await sendDay7NurtureEmail({ email: u.email });
      results.sent++;
    } catch (err) {
      results.failed++;
      results.errors.push({ email: u.email, error: err.message });
    }
  }

  return NextResponse.json({ campaign, ...results });
}

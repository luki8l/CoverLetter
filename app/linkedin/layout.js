const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://coverdraft.app';

export const metadata = {
  title: 'LinkedIn Message Generator — Recruiter Outreach | CoverDraft',
  description: 'Generate cold LinkedIn messages to recruiters and hiring managers that actually get replies. Connection requests, InMails, and open-role messages. Free.',
  keywords: ['linkedin message to recruiter', 'linkedin outreach message', 'linkedin connection request message', 'how to message recruiter on linkedin', 'linkedin inmail template'],
  alternates: { canonical: `${APP_URL}/linkedin` },
  openGraph: {
    title: 'LinkedIn Message Generator — Get Recruiter Replies',
    description: 'Stop sending "I am interested in opportunities at your company." Generate specific, short LinkedIn messages that stand out and get responses.',
    url: `${APP_URL}/linkedin`,
    type: 'website',
  },
};

export default function Layout({ children }) {
  return children;
}

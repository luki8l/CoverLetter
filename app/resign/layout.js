const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://coverdraft.app';

export const metadata = {
  title: 'Resignation Letter Generator — Professional & Free | CoverDraft',
  description: 'Write a professional resignation letter in seconds. Standard notice, immediate resignation, or retirement. Choose your tone. Free, no account needed.',
  keywords: ['resignation letter', 'resignation letter generator', 'how to write a resignation letter', 'resignation letter template', 'professional resignation letter'],
  alternates: { canonical: `${APP_URL}/resign` },
  openGraph: {
    title: 'Resignation Letter Generator — Write It Right',
    description: 'Professional resignation letter in 60 seconds. Standard notice, immediate, or retirement. No clichés. Free.',
    url: `${APP_URL}/resign`,
    type: 'website',
  },
};

export default function Layout({ children }) {
  return children;
}

import './globals.css';
import { Analytics } from '@vercel/analytics/next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://coverdraft.app';

// Organization schema — tells Google/Bing this is the official brand logo
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CoverDraft',
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  sameAs: [],
};

export const metadata = {
  title: 'CoverDraft — AI Cover Letter, Fit Score & Interview Prep',
  description:
    'Generate a tailored, ATS-friendly cover letter in seconds. Job fit score, interview prep & follow-up emails included. Free to start.',
  keywords: 'cover letter generator, AI cover letter, job fit score, interview prep, follow-up email, ATS cover letter, free cover letter writer',
  authors: [{ name: 'CoverDraft' }],
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'CoverDraft — From job post to interview-ready in minutes',
    description:
      'AI cover letter + job fit analysis + interview prep + follow-up emails. The complete job application workflow, automated. Free to start.',
    type: 'website',
    url: APP_URL,
    images: [{ url: `${APP_URL}/logo.png`, width: 512, height: 512, alt: 'CoverDraft Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoverDraft — From job post to interview-ready in minutes',
    description:
      'AI cover letter + job fit analysis + interview prep + follow-up emails. Free to start.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

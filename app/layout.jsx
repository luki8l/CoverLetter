import './globals.css';

export const metadata = {
  title: 'CoverDraft — AI Cover Letter, Fit Score & Interview Prep',
  description:
    'Generate a tailored, ATS-friendly cover letter in seconds. See your job fit score, get a letter strategy, prep for interviews, and write the perfect follow-up email — all in one workflow. Free to start.',
  keywords: 'cover letter generator, AI cover letter, job fit score, interview prep, follow-up email, ATS cover letter, free cover letter writer',
  authors: [{ name: 'CoverDraft' }],
  openGraph: {
    title: 'CoverDraft — From job post to interview-ready in minutes',
    description:
      'AI cover letter + job fit analysis + interview prep + follow-up emails. The complete job application workflow, automated. Free to start.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
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
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

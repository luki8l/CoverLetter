import './globals.css';

export const metadata = {
  title: 'Free AI Cover Letter Generator — Personalized in 30 Seconds',
  description:
    'Generate a tailored, ATS-friendly cover letter in seconds using AI. Paste the job description, add your background, and get a compelling cover letter instantly. Free to use.',
  keywords: 'cover letter generator, AI cover letter, free cover letter, ATS cover letter, cover letter writer',
  authors: [{ name: 'CoverDraft' }],
  openGraph: {
    title: 'Free AI Cover Letter Generator — Personalized in 30 Seconds',
    description: 'Generate a tailored, ATS-friendly cover letter in seconds using AI.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Cover Letter Generator — Personalized in 30 Seconds',
    description: 'Generate a tailored, ATS-friendly cover letter in seconds using AI.',
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

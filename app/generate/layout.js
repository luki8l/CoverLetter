export const metadata = {
  title: 'AI Cover Letter Generator — Free, ATS-Friendly | CoverDraft',
  description:
    'Generate a tailored, ATS-friendly cover letter in seconds. Paste the job description, add your background — get a professional letter instantly. Free to start.',
  keywords: [
    'ai cover letter generator',
    'cover letter generator free',
    'ats cover letter',
    'cover letter writer',
    'automatic cover letter',
    'cover letter ai',
  ],
  alternates: { canonical: 'https://coverdraft.app/generate' },
  openGraph: {
    title: 'AI Cover Letter Generator — Free & ATS-Friendly',
    description: 'Paste a job post. Get a tailored, professional cover letter in seconds. Includes job fit score and interview prep.',
    url: 'https://coverdraft.app/generate',
  },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to generate an AI cover letter with CoverDraft',
  description: 'Generate a tailored, ATS-friendly cover letter in under 60 seconds using CoverDraft.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Paste the job description',
      text: 'Copy the full job description from the listing and paste it into the Job Description field.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Add your background',
      text: 'Paste your CV or write a brief summary of your relevant experience and skills.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Choose tone and language',
      text: 'Select your preferred tone (professional, conversational, confident) and output language.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Generate and review',
      text: 'Click Generate. Your cover letter streams in real time. Review the job fit score and edit as needed.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Export or copy',
      text: 'Download as PDF or Word, or copy the text directly into your application.',
    },
  ],
};

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {children}
    </>
  );
}

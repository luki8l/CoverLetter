export const metadata = {
  title: 'Pricing — Free vs Pro | CoverDraft',
  description:
    'CoverDraft is free to start. Upgrade to Pro for €9/month to unlock unlimited cover letters, full job fit analysis, all 5 interview questions, and the letter strategy tip.',
  keywords: [
    'coverdraft pricing',
    'ai cover letter generator price',
    'cover letter generator free vs paid',
    'cover letter ai subscription',
  ],
  alternates: { canonical: 'https://coverdraft.app/pricing' },
  openGraph: {
    title: 'CoverDraft Pricing — Free to Start, Pro from €9/month',
    description: 'Start free with 2 cover letters per day. Upgrade to Pro for unlimited generations, full gap analysis, and all 5 interview prep questions.',
    url: 'https://coverdraft.app/pricing',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is CoverDraft free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. CoverDraft is free to start — no account needed. Free registered users get 2 cover letters per day. Pro is €9/month and includes unlimited generations, full gaps analysis, Letter Strategy tip, and all 5 interview questions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the Pro plan include?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pro (€9/month) includes unlimited cover letter and CV generations, the full job fit gaps analysis, the Letter Strategy tip (the exact angle to lead with), all 5 interview prep questions with answer frameworks, and priority AI processing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel my Pro subscription anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Cancel anytime from your account page. Your Pro access stays active until the end of the billing period.',
      },
    },
    {
      '@type': 'Question',
      name: 'What AI model does CoverDraft use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cover letters are generated using Claude Sonnet by Anthropic — one of the most capable models available, optimised for professional writing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does CoverDraft store my data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your form inputs are saved locally in your browser. Generated letters are not stored on servers — only anonymous generation counts are tracked to enforce free-tier limits.',
      },
    },
  ],
};

export default function Layout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

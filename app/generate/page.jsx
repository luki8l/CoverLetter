'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import GeneratorForm from '@/components/GeneratorForm';
import OutputSection from '@/components/OutputSection';
import UpgradeModal from '@/components/UpgradeModal';

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [unlockedEmail, setUnlockedEmail] = useState('');
  const [lastForm, setLastForm] = useState(null);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setUpgraded(true);
    }
  }, [searchParams]);

  async function generate(formData) {
    setIsLoading(true);
    setError('');
    setLastForm(formData);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: unlockedEmail || undefined }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setShowModal(true);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setCoverLetter(data.coverLetter);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleRegenerate() {
    if (lastForm) generate(lastForm);
  }

  function handleEmailUnlock(email) {
    setUnlockedEmail(email);
    setShowModal(false);
    // Retry generation automatically with the email
    if (lastForm) {
      setTimeout(() => generate({ ...lastForm }), 300);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cover Letter Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below and get a personalized cover letter in seconds.
          </p>
        </div>

        {upgraded && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-800 font-medium">
              Welcome to Pro! Enjoy unlimited cover letter generations.
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <GeneratorForm onGenerate={generate} isLoading={isLoading} />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <OutputSection
          coverLetter={coverLetter}
          onRegenerate={handleRegenerate}
          isLoading={isLoading}
        />
      </main>

      <footer className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>

      {showModal && (
        <UpgradeModal
          onClose={() => setShowModal(false)}
          onEmailSubmit={handleEmailUnlock}
        />
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>}>
      <GeneratePageInner />
    </Suspense>
  );
}

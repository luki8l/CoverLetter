'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
    if (searchParams.get('upgraded') === 'true') setUpgraded(true);
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

      if (res.status === 429) { setShowModal(true); return; }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }

      setCoverLetter(data.coverLetter);
      // Smooth scroll to output
      setTimeout(() => document.getElementById('output-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEmailUnlock(email) {
    setUnlockedEmail(email);
    setShowModal(false);
    if (lastForm) setTimeout(() => generate(lastForm), 300);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cover Letter Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste a job URL to auto-fill everything, or fill in the fields manually.
          </p>
        </div>

        {upgraded && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-800 font-medium">Welcome to Pro — unlimited generations.</p>
          </div>
        )}

        {/* Form card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <GeneratorForm onGenerate={generate} isLoading={isLoading} />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Scroll anchor */}
        <div id="output-anchor" />

        <OutputSection
          coverLetter={coverLetter}
          onRegenerate={() => lastForm && generate(lastForm)}
          isLoading={isLoading}
          formData={lastForm}
        />
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>

      {showModal && (
        <UpgradeModal onClose={() => setShowModal(false)} onEmailSubmit={handleEmailUnlock} />
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    }>
      <GeneratePageInner />
    </Suspense>
  );
}

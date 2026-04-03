'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GeneratorForm from '@/components/GeneratorForm';
import OutputSection from '@/components/OutputSection';
import UpgradeModal from '@/components/UpgradeModal';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const { toasts, toast } = useToast();
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
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
    setIsStreaming(false);
    setError('');
    setCoverLetter('');
    setLastForm(formData);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: unlockedEmail || undefined }),
      });

      if (res.status === 429) {
        setIsLoading(false);
        setShowModal(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        setIsLoading(false);
        return;
      }

      // Stream the response
      setIsStreaming(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      // Scroll to output as soon as streaming starts
      setTimeout(() => document.getElementById('output-anchor')?.scrollIntoView({ behavior: 'smooth' }), 150);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setCoverLetter(result);
      }

      setIsStreaming(false);
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cover Letter Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste a job URL to auto-fill, or fill in manually. Your inputs are saved automatically.
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

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <GeneratorForm onGenerate={generate} isLoading={isLoading || isStreaming} />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div id="output-anchor" />

        <OutputSection
          coverLetter={coverLetter}
          isStreaming={isStreaming}
          onRegenerate={() => lastForm && generate(lastForm)}
          isLoading={isLoading}
          formData={lastForm}
          onToast={toast}
        />
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>

      {showModal && (
        <UpgradeModal onClose={() => setShowModal(false)} onEmailSubmit={handleEmailUnlock} />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
      <GeneratePageInner />
    </Suspense>
  );
}

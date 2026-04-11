import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { allPosts } from '@/lib/posts/index.js';

export const metadata = {
  title: 'Job Application Tips & Guides | CoverDraft Blog',
  description:
    'Practical guides on cover letters, CV optimisation, interview prep, and job applications. Written for people actively job hunting — no fluff.',
  alternates: { canonical: 'https://coverdraft.app/blog' },
  openGraph: {
    title: 'CoverDraft Blog — Job Application Tips That Actually Work',
    description: 'Cover letter guides, ATS tips, interview prep, and more. Practical advice for active job seekers.',
    url: 'https://coverdraft.app/blog',
  },
};

export default function BlogIndex() {
  const sorted = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Blog</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Job application guides that actually help
          </h1>
          <p className="text-lg text-gray-500">
            Practical advice on cover letters, CVs, interviews, and the full job search workflow.
          </p>
        </div>

        {/* Post list */}
        <div className="divide-y divide-gray-100">
          {sorted.map((post) => (
            <article key={post.slug} className="py-8 group">
              <div className="flex items-center gap-3 mb-3">
                <time className="text-xs text-gray-400" dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </time>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>

              <Link href={`/blog/${post.slug}`} className="block">
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">{post.description}</p>
              </Link>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-block mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                Read →
              </Link>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>
    </div>
  );
}

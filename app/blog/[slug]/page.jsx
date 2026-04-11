import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getPost, allPosts } from '@/lib/posts/index.js';

const APP_URL = 'https://coverdraft.app';

export async function generateStaticParams() {
  return allPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return {};
  const { meta } = post;
  return {
    title: `${meta.titleTag || meta.title} | CoverDraft`,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `${APP_URL}/blog/${meta.slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${APP_URL}/blog/${meta.slug}`,
      type: 'article',
      publishedTime: meta.date,
    },
  };
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const { meta, Content } = post;

  // Resolve related posts
  const relatedPosts = meta.related
    ? meta.related
        .map((slug) => allPosts.find((p) => p.slug === slug))
        .filter(Boolean)
    : [];

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    author: { '@type': 'Organization', name: 'CoverDraft', url: APP_URL },
    publisher: {
      '@type': 'Organization',
      name: 'CoverDraft',
      url: APP_URL,
      logo: { '@type': 'ImageObject', url: `${APP_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${APP_URL}/blog/${meta.slug}` },
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: APP_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${APP_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: meta.title, item: `${APP_URL}/blog/${meta.slug}` },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-gray-600 transition">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{meta.titleTag || meta.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <time className="text-xs text-gray-400" dateTime={meta.date}>
              {new Date(meta.date).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </time>
            <span className="text-gray-200">·</span>
            <span className="text-xs text-gray-400">{meta.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {meta.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">{meta.description}</p>
        </header>

        {/* Article body */}
        <article className="prose prose-gray prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-5
          prose-li:text-gray-600 prose-li:leading-relaxed
          prose-ul:my-4 prose-ol:my-4
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-a:text-indigo-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
          prose-em:text-gray-500
        ">
          <Content />
        </article>

        {/* CTA block */}
        <div className="mt-14 bg-indigo-50 border border-indigo-100 rounded-2xl p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Try it free</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Generate your cover letter in 60 seconds</h2>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Paste a job description and your background. CoverDraft writes a tailored, ATS-friendly cover letter
            — with a job fit score, gap analysis, and interview prep. No account needed to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
            >
              Generate cover letter free →
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 transition px-4"
            >
              ← Back to blog
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Read next</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/40 transition"
                >
                  <p className="text-xs text-gray-400 mb-1.5">{p.readTime}</p>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 leading-snug transition">
                    {p.titleTag || p.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>
    </div>
  );
}

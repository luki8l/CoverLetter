import { allPosts } from '@/lib/posts/index.js';

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://coverdraft.app';

  const staticRoutes = [
    { url: baseUrl,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 1    },
    { url: `${baseUrl}/generate`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.95 },
    { url: `${baseUrl}/followup`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9  },
    { url: `${baseUrl}/cv`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/pricing`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7  },
    { url: `${baseUrl}/linkedin`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/resign`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.88 },
    { url: `${baseUrl}/blog`,             lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8  },
  ];

  const blogRoutes = allPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...blogRoutes];
}

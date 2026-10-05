import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';
import { features } from '@/content/features';
import { guides } from '@/content/guides';

type Entry = MetadataRoute.Sitemap[number];

const staticRoutes: Array<{
  path: string;
  changeFrequency: Entry['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/features', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/guides', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/feedback', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/status', changeFrequency: 'daily', priority: 0.3 },
  { path: '/login', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/signup', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
];

// Static pages carry no `lastModified`: stamping them with the request time
// tells crawlers nothing, and search engines ignore the field once it proves
// unreliable. Guides have a real date, so they do.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map(({ path, changeFrequency, priority }): Entry => ({
      url: `${SITE_URL}${path}`,
      changeFrequency,
      priority,
    })),
    ...features.map(({ slug }): Entry => ({
      url: `${SITE_URL}/features/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.9,
    })),
    ...guides.map(({ slug, updated }): Entry => ({
      url: `${SITE_URL}/guides/${slug}`,
      lastModified: updated,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  ];
}

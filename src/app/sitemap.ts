import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
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

// No `lastModified`: stamping every URL with the request time tells crawlers
// nothing, and search engines ignore the field once it proves unreliable.
export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}

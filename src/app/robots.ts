import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/callback',
        '/dashboard',
        '/essays',
        '/profile',
        '/settings',
        '/onboarding',
        '/forgot_password',
        '/reset_password',
        '/verify-email',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

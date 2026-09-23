import type { MetadataRoute } from 'next';
import { SITE_ACCENT_COLOR, SITE_BACKGROUND_COLOR, SITE_DESCRIPTION, SITE_NAME } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: SITE_BACKGROUND_COLOR,
    theme_color: SITE_ACCENT_COLOR,
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

import type { Metadata } from 'next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/config/site';

interface PageMetadataInput {
  /** Page title without the site suffix. Omit for the homepage. */
  title?:       string;
  description?: string;
  /** Route path, e.g. '/about'. Becomes the canonical and og:url. */
  path:         string;
}

/**
 * Builds the metadata for an indexable public page.
 *
 * Next.js merges metadata shallowly, so a page that only sets `title` would
 * inherit its parent's canonical URL and Open Graph block unchanged. Every
 * public page goes through this helper so each one gets its own canonical,
 * og:url, og:title and og:description.
 */
export function pageMetadata({ title, description = SITE_DESCRIPTION, path }: PageMetadataInput): Metadata {
  const socialTitle = title ? `${title} — ${SITE_NAME}` : SITE_TITLE;
  // Declared explicitly: a page that defines its own `openGraph` block no
  // longer inherits the root segment's file-based opengraph-image.
  const images = [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE_TITLE }];

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type:     'website',
      siteName: SITE_NAME,
      locale:   'en_US',
      url:      path,
      title:    socialTitle,
      description,
      images,
    },
    twitter: {
      card:  'summary_large_image',
      title: socialTitle,
      description,
      images,
    },
  };
}

/** Serializes JSON-LD for a `<script type="application/ld+json">` tag. */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

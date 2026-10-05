import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentArticle, { ContentCards, ContentCta } from '@/components/marketing/ContentArticle';
import { getFeature } from '@/content/features';
import { guides, getGuide } from '@/content/guides';
import { SITE_NAME, SITE_URL } from '@/config/site';
import { jsonLd, pageMetadata } from '@/libs/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Only the slugs below exist — anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  const base = pageMetadata({
    title:       guide.title,
    description: guide.description,
    path:        `/guides/${guide.slug}`,
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type:          'article',
      publishedTime: guide.published,
      modifiedTime:  guide.updated,
    },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const path = `/guides/${guide.slug}`;
  const feature = getFeature(guide.relatedFeature);
  const otherGuides = guides.filter(g => g.slug !== guide.slug);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    mainEntityOfPage: `${SITE_URL}${path}`,
    image: `${SITE_URL}/opengraph-image`,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <ContentArticle
      content={guide}
      parent={{ label: 'Guides', href: '/guides' }}
      path={path}
      meta={<>Last updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time></>}
    >
      {feature && (
        <ContentCta
          title={`Put it into practice with ${SITE_NAME}`}
          text={feature.description}
        />
      )}
      <ContentCards
        heading="More writing guides"
        cards={otherGuides.map(g => ({
          href:  `/guides/${g.slug}`,
          title: g.title,
          desc:  g.description,
        }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd) }}
      />
    </ContentArticle>
  );
}

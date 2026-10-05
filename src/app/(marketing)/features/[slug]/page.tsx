import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentArticle, { ContentCards, ContentCta } from '@/components/marketing/ContentArticle';
import { features, getFeature } from '@/content/features';
import { getGuide } from '@/content/guides';
import { pageMetadata } from '@/libs/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Only the slugs below exist — anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return features.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) return {};

  return pageMetadata({
    title:       feature.title,
    description: feature.description,
    path:        `/features/${feature.slug}`,
  });
}

export default async function FeaturePage({ params }: PageProps) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) notFound();

  const otherFeatures = features.filter(f => f.slug !== feature.slug);
  const relatedGuides = feature.relatedGuides.map(getGuide).filter(g => g !== undefined);

  return (
    <ContentArticle
      content={feature}
      parent={{ label: 'Features', href: '/features' }}
      path={`/features/${feature.slug}`}
    >
      <ContentCta
        title="Try it on your next essay"
        text="Create a free account and get feedback on your first draft in minutes."
      />
      {relatedGuides.length > 0 && (
        <ContentCards
          heading="Related writing guides"
          cards={relatedGuides.map(g => ({
            href:  `/guides/${g.slug}`,
            title: g.title,
            desc:  g.description,
          }))}
        />
      )}
      <ContentCards
        heading="More features"
        cards={otherFeatures.map(f => ({
          href:  `/features/${f.slug}`,
          title: f.title,
          desc:  f.description,
        }))}
      />
    </ContentArticle>
  );
}

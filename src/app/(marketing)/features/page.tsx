import type { Metadata } from 'next';
import { ContentCards, ContentCta } from '@/components/marketing/ContentArticle';
import { features } from '@/content/features';
import { pageMetadata } from '@/libs/seo';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = pageMetadata({
  title: 'Features',
  description:
    'Everything Scriverly does for your essays: AI feedback and scoring, an outline generator, and a grammar and style checker built for academic writing.',
  path: '/features',
});

export default function FeaturesPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Features</p>
          <h1 className={page.proseTitle}>Tools for every stage of an essay</h1>
          <p className={page.proseSubtitle}>
            Plan the structure, write with feedback beside you, and fix what matters before you
            submit. Each tool is tailored to your essay type and academic level.
          </p>
        </header>

        <ContentCards
          cards={features.map(f => ({
            href:  `/features/${f.slug}`,
            title: f.title,
            desc:  f.description,
          }))}
        />

        <ContentCta
          title="See it on your own writing"
          text="Create a free account — no credit card required."
        />

      </div>
    </section>
  );
}

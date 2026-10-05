import type { Metadata } from 'next';
import { ContentCards, ContentCta } from '@/components/marketing/ContentArticle';
import { guides } from '@/content/guides';
import { pageMetadata } from '@/libs/seo';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = pageMetadata({
  title: 'Essay Writing Guides',
  description:
    'Practical, step-by-step guides to academic essay writing: argumentative essays, outlines, thesis statements, and more.',
  path: '/guides',
});

export default function GuidesPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>Guides</p>
          <h1 className={page.proseTitle}>Essay writing guides</h1>
          <p className={page.proseSubtitle}>
            Clear, practical advice on the parts of essay writing that students find hardest —
            written to be used, not just read.
          </p>
        </header>

        <ContentCards
          cards={guides.map(g => ({
            href:  `/guides/${g.slug}`,
            title: g.title,
            desc:  g.description,
          }))}
        />

        <ContentCta
          title="Write your next essay with feedback built in"
          text="Scriverly gives you an outline, a score, and specific improvements as you write."
        />

      </div>
    </section>
  );
}

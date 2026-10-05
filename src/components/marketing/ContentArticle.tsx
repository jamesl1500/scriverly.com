import type { ReactNode } from 'react';
import Link from 'next/link';
import type { ContentPage } from '@/content/types';
import { SITE_URL } from '@/config/site';
import { jsonLd } from '@/libs/seo';
import page from '@/styles/pages/marketing.module.scss';

interface Crumb {
  label: string;
  href:  string;
}

interface ContentArticleProps {
  content:  ContentPage;
  /** Parent section, e.g. { label: 'Features', href: '/features' }. */
  parent:   Crumb;
  /** Path of this page, e.g. '/features/essay-feedback'. */
  path:     string;
  meta?:    ReactNode;
  children?: ReactNode;
}

/** Shared layout for feature and guide pages: breadcrumb, header, body copy. */
export default function ContentArticle({ content, parent, path, meta, children }: ContentArticleProps) {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: parent.label, item: `${SITE_URL}${parent.href}` },
      { '@type': 'ListItem', position: 3, name: content.title, item: `${SITE_URL}${path}` },
    ],
  };

  return (
    <article className={page.prosePage}>
      <div className={page.container}>
        <nav className={page.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={parent.href}>{parent.label}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{content.label}</span>
        </nav>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>{parent.label}</p>
          <h1 className={page.proseTitle}>{content.title}</h1>
          <p className={page.proseSubtitle}>{content.intro}</p>
          {meta && <p className={page.proseMeta}>{meta}</p>}
        </header>

        <div className={`${page.proseBody} ${page.contentBody}`}>
          {content.sections.map(section => {
            const List = section.ordered ? 'ol' : 'ul';
            return (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
                {section.list && (
                  <List>
                    {section.list.map(item => <li key={item}>{item}</li>)}
                  </List>
                )}
                {section.after?.map(text => <p key={text}>{text}</p>)}
              </section>
            );
          })}
        </div>

        {children}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />
    </article>
  );
}

interface CardLink {
  href:  string;
  title: string;
  desc:  string;
}

/** Grid of linked cards — used for index pages and "related" blocks. */
export function ContentCards({ heading, cards }: { heading?: string; cards: CardLink[] }) {
  return (
    <div className={page.contentCards}>
      {heading && <h2 className={page.contentCardsHeading}>{heading}</h2>}
      <ul className={page.contentCardGrid}>
        {cards.map(card => (
          <li key={card.href}>
            <Link href={card.href} className={page.contentCard}>
              <span className={page.contentCardTitle}>{card.title}</span>
              <span className={page.contentCardDesc}>{card.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Closing call to action shared by content pages. */
export function ContentCta({ title, text }: { title: string; text: string }) {
  return (
    <div className={page.contentCta}>
      <h2 className={page.contentCtaTitle}>{title}</h2>
      <p className={page.contentCtaText}>{text}</p>
      <Link href="/signup" className={page.heroPrimary}>
        Get started free
      </Link>
    </div>
  );
}

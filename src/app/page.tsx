import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, BookOpen, FileText, BarChart2, ArrowRight } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import styles from '@/styles/layouts/marketing-layout.module.scss';
import page from '@/styles/pages/marketing.module.scss';
import { FREE_ANALYSIS_LIMIT, FREE_OUTLINE_LIMIT } from '@/config/consts';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/config/site';
import { jsonLd, pageMetadata } from '@/libs/seo';

// Title and description fall back to the root layout's defaults.
export const metadata: Metadata = pageMetadata({ path: '/' });

const PREMIUM_PRICE_USD = 9;

const features = [
  {
    icon: <Sparkles size={18} />,
    title: 'AI Essay Analysis',
    desc: 'Get a scored breakdown of clarity, structure, grammar, and vocabulary the moment you finish writing.',
  },
  {
    icon: <BookOpen size={18} />,
    title: 'Smart Outlines',
    desc: 'Generate structured outlines tailored to your essay type and academic level before you write a single word.',
  },
  {
    icon: <FileText size={18} />,
    title: 'Grammar & Style',
    desc: 'Receive inline suggestions for grammar issues and style improvements you can apply with one click.',
  },
  {
    icon: <BarChart2 size={18} />,
    title: 'Essay Dashboard',
    desc: 'Track word goals, due dates, and progress across all your essays in one organized view.',
  },
];

const steps = [
  {
    n: '1',
    title: 'Create your essay',
    desc: 'Set your topic, essay type, academic level, and word goal. Scriverly tailors every suggestion to your context.',
  },
  {
    n: '2',
    title: 'Write with guidance',
    desc: 'The AI sidebar surfaces insights as you type. Pause for five seconds and it auto-analyzes your latest draft.',
  },
  {
    n: '3',
    title: 'Refine and submit',
    desc: 'Apply grammar fixes and style recommendations with one click. Track your progress toward your word goal.',
  },
];

const faqs = [
  {
    q: 'Is Scriverly free to use?',
    a: `Yes. The free plan includes ${FREE_ANALYSIS_LIMIT} AI essay analyses and ${FREE_OUTLINE_LIMIT} outline generations every month, with no credit card required. Premium is $${PREMIUM_PRICE_USD} per month and removes those limits.`,
  },
  {
    q: 'What does the AI essay analysis check?',
    a: 'Each analysis gives your essay an overall score out of 100 and a breakdown across five dimensions: clarity, structure, style alignment, grammar, and vocabulary. You also get specific style recommendations and spelling and grammar fixes you can apply in one click.',
  },
  {
    q: 'Does Scriverly write my essay for me?',
    a: 'No. Scriverly is a writing assistant, not a ghostwriter. Outlines suggest headings and talking points, and the analysis explains how to improve what you have written — the words stay yours.',
  },
  {
    q: 'Which essay types and academic levels are supported?',
    a: 'Argumentative, analytical, expository, persuasive, narrative, descriptive, and comparative essays, from high school through undergraduate, graduate, and doctoral level. Feedback can follow APA, MLA, or Chicago citation conventions.',
  },
  {
    q: 'Is my writing used to train AI models?',
    a: 'No. Your essays are sent to our AI provider only to generate your feedback, and we do not use your content to train AI models. You keep full ownership of everything you write.',
  },
];

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Premium', price: String(PREMIUM_PRICE_USD), priceCurrency: 'USD' },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function HomePage() {
  return (
    <div className={styles.shell}>
      <MarketingNav />

      <main className={styles.main}>
        {/* ── Hero ──────────────────────────────────── */}
        <section className={page.hero}>
          <div className={page.container}>
            <div className={page.heroBadge}>
              <Sparkles size={11} aria-hidden="true" />
              AI-powered academic writing
            </div>
            <h1 className={page.heroTitle}>
              Write better essays with <span>AI that understands</span> academic writing
            </h1>
            <p className={page.heroSubtitle}>
              Real-time feedback, smart outlines, and style guidance — all tailored to your essay type and academic level.
            </p>
            <div className={page.heroActions}>
              <Link href="/signup" className={page.heroPrimary}>
                Get started free
              </Link>
              <Link href="/about" className={page.heroSecondary}>
                Learn more <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <p className={page.heroNote}>No credit card required.</p>
          </div>
        </section>

        {/* ── Features ─────────────────────────────── */}
        <section className={page.features}>
          <div className={page.container}>
            <p className={page.sectionLabel}>Features</p>
            <h2 className={page.sectionTitle}>Everything you need to write well</h2>
            <p className={page.sectionSubtitle}>
              Scriverly combines AI analysis with a focused writing environment so you can think more and revise less.
            </p>
            <div className={page.featureGrid}>
              {features.map(f => (
                <div key={f.title} className={page.featureCard}>
                  <div className={page.featureIcon} aria-hidden="true">{f.icon}</div>
                  <h3 className={page.featureTitle}>{f.title}</h3>
                  <p className={page.featureDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────── */}
        <section className={page.howItWorks}>
          <div className={page.container}>
            <p className={page.sectionLabel}>How it works</p>
            <h2 className={page.sectionTitle}>From blank page to polished draft</h2>
            <p className={page.sectionSubtitle}>
              Three simple steps to an essay you&apos;re proud to submit.
            </p>
            <div className={page.steps}>
              {steps.map(s => (
                <div key={s.n} className={page.step}>
                  <div className={page.stepNumber} aria-hidden="true">{s.n}</div>
                  <h3 className={page.stepTitle}>{s.title}</h3>
                  <p className={page.stepDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────── */}
        <section className={page.faq}>
          <div className={page.container}>
            <p className={page.sectionLabel}>FAQ</p>
            <h2 className={page.sectionTitle}>Common questions</h2>
            <dl className={page.faqList}>
              {faqs.map(({ q, a }) => (
                <div key={q} className={page.faqItem}>
                  <dt className={page.faqQuestion}>{q}</dt>
                  <dd className={page.faqAnswer}>{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── CTA band ─────────────────────────────── */}
        <section className={page.ctaBand}>
          <div className={page.container}>
            <h2 className={page.ctaTitle}>Ready to write your best work?</h2>
            <p className={page.ctaSubtitle}>
              Join students and academics who use Scriverly to write clearer, more structured essays.
            </p>
            <div className={page.heroActions}>
              <Link href="/signup" className={page.heroPrimary}>
                Create a free account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }}
      />
    </div>
  );
}


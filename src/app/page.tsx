import Link from 'next/link';
import { Sparkles, BookOpen, FileText, BarChart2, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import styles from '@/styles/layouts/marketing-layout.module.scss';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'Scriverly — AI-Powered Academic Writing Assistant',
  description:
    'Write better essays with real-time AI feedback, smart outlines, grammar analysis, and style guidance tailored to your academic level.',
};

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
    </div>
  );
}


import type { Metadata } from 'next';
import page from '@/styles/pages/marketing.module.scss';

export const metadata: Metadata = {
  title: 'About — Scriverly',
  description:
    'Learn about Scriverly — the AI-powered academic writing assistant built for students, researchers, and academics.',
};

const values = [
  {
    icon: '✍️',
    title: 'Writing first',
    desc: 'Every feature is designed to get out of your way and let you write. The AI surfaces when you need it, not constantly.',
  },
  {
    icon: '🎓',
    title: 'Academically aware',
    desc: 'Feedback is tailored to your essay type, academic level, and citation style — not generic writing advice.',
  },
  {
    icon: '🔒',
    title: 'Your work is yours',
    desc: "We don't train models on your essays. Your writing stays private, and you retain full ownership of everything you create.",
  },
];

export default function AboutPage() {
  return (
    <section className={page.prosePage}>
      <div className={page.container}>

        <header className={page.proseHeader}>
          <p className={page.proseEyebrow}>About</p>
          <h1 className={page.proseTitle}>Built for academic writers</h1>
          <p className={page.proseSubtitle}>
            Scriverly started from a simple frustration: most writing tools give generic feedback that
            ignores the specific demands of academic writing. We set out to fix that.
          </p>
        </header>

        {/* Values */}
        <div className={page.valuesGrid}>
          {values.map(v => (
            <div key={v.title} className={page.valueCard}>
              <div className={page.valueIcon} aria-hidden="true">{v.icon}</div>
              <h3 className={page.valueTitle}>{v.title}</h3>
              <p className={page.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className={page.proseBody}>
          <h2>Our story</h2>
          <p>
            Scriverly was founded by a team of researchers and engineers who spent years watching
            students struggle not with ideas, but with expressing them clearly on paper. Traditional
            grammar checkers flag comma splices; they don&apos;t tell you your argument structure is
            unclear or that your vocabulary is mismatched to your audience.
          </p>
          <p>
            We built Scriverly to be the writing assistant that understands context — one that knows
            the difference between an argumentative essay at the undergraduate level and a literature
            review at the graduate level, and gives feedback accordingly.
          </p>

          <h2>What Scriverly does</h2>
          <p>
            When you write in Scriverly, a large language model trained on academic writing patterns
            analyzes your essay across five dimensions: clarity, structure, style alignment, grammar,
            and vocabulary. It surfaces specific, actionable suggestions — not just a score — so
            you know exactly what to improve.
          </p>
          <p>
            The outline generator lets you scaffold your essay before writing, and the AI sidebar
            auto-updates as you type so feedback is always relevant to your latest draft.
          </p>

          <h2>Who we&apos;re for</h2>
          <p>
            Scriverly is designed for undergraduate and graduate students, researchers writing
            conference papers, and faculty who want to improve their own academic prose. If you write
            structured, argument-driven documents and want smarter feedback than a spellchecker can
            provide, Scriverly is for you.
          </p>

          <h2>Get in touch</h2>
          <p>
            We read every message. If you have a question, feature request, or just want to say
            hello, head to our <a href="/contact">contact page</a> or email us at{' '}
            <a href="mailto:hello@scriverly.com">hello@scriverly.com</a>.
          </p>
        </div>

      </div>
    </section>
  );
}

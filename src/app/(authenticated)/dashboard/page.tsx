import Link from 'next/link';
import { FileText, Clock, Plus, BookOpen, TrendingUp } from 'lucide-react';
import styles from '@/styles/components/Dashboard.module.scss';

type EssayStatus = 'published' | 'draft';

interface Essay {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  status: EssayStatus;
  wordCount: number;
  updatedAt: string;
}

const DUMMY_ESSAYS: Essay[] = [
  {
    id: '1',
    title: 'The Quiet Case for Reading Slowly',
    excerpt:
      'In an age of speed-reading apps and five-minute summaries, there is something quietly radical about choosing to read a single page twice.',
    tag: 'Culture',
    status: 'published',
    wordCount: 1420,
    updatedAt: 'Apr 27, 2026',
  },
  {
    id: '2',
    title: 'What AI Gets Wrong About Creativity',
    excerpt:
      'Generative models can mimic surface form with uncanny precision, but creativity is not pattern-matching — it is the deliberate violation of expectation.',
    tag: 'Technology',
    status: 'published',
    wordCount: 2105,
    updatedAt: 'Apr 24, 2026',
  },
  {
    id: '3',
    title: 'On Rereading Books You No Longer Agree With',
    excerpt:
      'Returning to a book that shaped you, only to find you have outgrown its arguments, is one of the stranger pleasures of a reading life.',
    tag: 'Books',
    status: 'draft',
    wordCount: 870,
    updatedAt: 'Apr 22, 2026',
  },
  {
    id: '4',
    title: 'The Architecture of Attention',
    excerpt:
      'Every environment is an attention machine. The question is not whether your surroundings shape your focus, but whether you shaped your surroundings first.',
    tag: 'Productivity',
    status: 'published',
    wordCount: 1680,
    updatedAt: 'Apr 18, 2026',
  },
  {
    id: '5',
    title: 'Why Good Arguments Feel Uncomfortable',
    excerpt:
      'A truly compelling argument does not make you feel affirmed — it makes you feel slightly unsettled, like a chair with one leg a millimetre shorter than the rest.',
    tag: 'Philosophy',
    status: 'draft',
    wordCount: 640,
    updatedAt: 'Apr 15, 2026',
  },
  {
    id: '6',
    title: 'Notes on Finishing Things',
    excerpt:
      'Most creative problems are not problems of starting. They are problems of the long middle — the stretch where the idea has lost its novelty but has not yet become a result.',
    tag: 'Writing',
    status: 'draft',
    wordCount: 310,
    updatedAt: 'Apr 10, 2026',
  },
];

const STATS = [
  { label: 'Total essays', value: '12', icon: FileText },
  { label: 'Published', value: '7', icon: BookOpen },
  { label: 'In draft', value: '5', icon: Clock },
  { label: 'Words written', value: '18.4k', icon: TrendingUp },
];

function formatWordCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageHeading}>Dashboard</h1>
          <p className={styles.pageSubheading}>Welcome back. Here&apos;s where your writing lives.</p>
        </div>
        <div className={styles.pageActions}>
          <Link href="/essays/new" className={styles.newEssayBtn}>
            <Plus size={15} aria-hidden="true" />
            New essay
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        {STATS.map(({ label, value }) => (
          <div key={label} className={styles.statCard}>
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent essays */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent essays</h2>
        <Link href="/essays" className={styles.sectionLink}>
          View all
        </Link>
      </div>

      <div className={styles.grid}>
        {DUMMY_ESSAYS.map((essay) => (
          <Link key={essay.id} href={`/essays/${essay.id}`} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.cardTag}>{essay.tag}</span>
              <span
                className={[
                  styles.cardStatus,
                  essay.status === 'published'
                    ? styles.statusPublished
                    : styles.statusDraft,
                ].join(' ')}
              >
                {essay.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>

            <h3 className={styles.cardTitle}>{essay.title}</h3>
            <p className={styles.cardExcerpt}>{essay.excerpt}</p>

            <div className={styles.cardFooter}>
              <div className={styles.cardMeta}>
                <span className={styles.cardMetaItem}>
                  <FileText size={11} aria-hidden="true" />
                  {formatWordCount(essay.wordCount)} words
                </span>
              </div>
              <span className={styles.cardDate}>{essay.updatedAt}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

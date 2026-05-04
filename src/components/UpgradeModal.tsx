'use client';

import { useState } from 'react';
import { X, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import styles from '@/styles/components/UpgradeModal.module.scss';

interface UpgradeModalProps {
  /** 'analysis' | 'outline' — which feature hit its limit */
  feature:  'analysis' | 'outline';
  used:     number;
  limit:    number;
  onClose:  () => void;
}

const FEATURE_LABELS: Record<UpgradeModalProps['feature'], string> = {
  analysis: 'AI analyses',
  outline:  'outline generations',
};

export default function UpgradeModal({ feature, used, limit, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const label = FEATURE_LABELS[feature];

  async function handleUpgrade() {
    setLoading(true);
    // Redirect to checkout — server-side route returns a 303 to Stripe
    window.location.href = '/api/billing/checkout';
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={15} aria-hidden="true" />
          </button>

          <span className={styles.limitBadge}>
            <Zap size={11} aria-hidden="true" />
            Monthly limit reached
          </span>

          <h2 id="upgrade-title" className={styles.title}>
            Upgrade to Premium
          </h2>
          <p className={styles.subtitle}>
            You&apos;ve used all your free {label} for this month.
            Upgrade for unlimited access.
          </p>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* Usage bar */}
          <div className={styles.usageBlock}>
            <div className={styles.usageLabel}>
              <span>{label} used this month</span>
              <strong>{used} / {limit}</strong>
            </div>
            <div className={styles.usageTrack}>
              <div
                className={styles.usageFill}
                style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
              />
            </div>
          </div>

          {/* Feature list */}
          <ul className={styles.featureList} aria-label="Premium features">
            <li className={styles.featureItem}>
              <CheckCircle2 size={15} aria-hidden="true" />
              Unlimited AI essay analysis
            </li>
            <li className={styles.featureItem}>
              <CheckCircle2 size={15} aria-hidden="true" />
              Unlimited AI outline generation
            </li>
            <li className={styles.featureItem}>
              <CheckCircle2 size={15} aria-hidden="true" />
              Priority support
            </li>
            <li className={styles.featureItem}>
              <CheckCircle2 size={15} aria-hidden="true" />
              Cancel anytime
            </li>
          </ul>

          {/* CTA */}
          <div className={styles.cta}>
            <button
              type="button"
              className={styles.upgradeBtn}
              onClick={handleUpgrade}
              disabled={loading}
            >
              <Sparkles size={14} aria-hidden="true" />
              {loading ? 'Redirecting to checkout…' : 'Upgrade to Premium — $9/mo'}
            </button>
            <button
              type="button"
              className={styles.cancelLink}
              onClick={onClose}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

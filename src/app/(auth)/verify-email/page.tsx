'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, RotateCcw } from 'lucide-react';

import { Button, Logo } from '@/components/ui';
import { resendVerification, getAuthError } from '@/services/authService';
import styles from '@/styles/layouts/auth-layout.module.scss';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? 'your email';
  const [resent, setResent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    setIsResending(true);
    setResendError(null);
    try {
      await resendVerification(email);
      setResent(true);
    } catch (err) {
      setResendError(getAuthError(err));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Logo size="lg" />
      </div>

      <div className={styles.iconCircle} aria-hidden="true">
        <Mail size={28} />
      </div>

      <h1 className={styles.heading}>Check your email</h1>
      <p className={styles.subheading}>
        We sent a verification link to{' '}
        <span className={styles.emailAddress}>{email}</span>.
        Click the link to activate your account.
      </p>

      <div className={styles.resendRow}>
        {resent ? (
          <p
            style={{
              fontSize: '0.8125rem',
              color: '#3A9A6B',
              fontWeight: 500,
            }}
          >
            ✓ Verification email resent
          </p>
        ) : (
          <>
            <p
              style={{
                fontSize: '0.8125rem',
                color: '#9C9087',
                textAlign: 'center',
              }}
            >
              Didn&apos;t receive it? Check your spam folder, or&hellip;
            </p>
            <Button
              variant="ghost"
              size="md"
              isLoading={isResending}
              onClick={handleResend}
              leftIcon={<RotateCcw size={15} />}
            >
              Resend verification email
            </Button>
            {resendError && (
              <p
                className={`${styles.alert} ${styles.alertError}`}
                role="alert"
                style={{ margin: 0 }}
              >
                {resendError}
              </p>
            )}
          </>
        )}
      </div>

      <p className={styles.footer}>
        <Link href="/login">
          <ArrowLeft
            size={13}
            style={{
              display: 'inline',
              verticalAlign: 'middle',
              marginRight: '4px',
            }}
            aria-hidden="true"
          />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

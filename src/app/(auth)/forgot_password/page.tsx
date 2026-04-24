'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/libs/validations/auth';
import { Button, Input, FormField, Logo } from '@/components/ui';
import { forgotPassword, getAuthError } from '@/services/authService';
import styles from '@/styles/layouts/auth-layout.module.scss';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null);
    try {
      await forgotPassword(values);
      setSent(true);
    } catch (err) {
      setServerError(getAuthError(err));
    }
  }

  if (sent) {
    return (
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo size="lg" />
        </div>

        <div className={styles.iconCircle}>
          <Mail size={28} aria-hidden="true" />
        </div>

        <h1 className={styles.heading}>Check your inbox</h1>
        <p className={styles.subheading}>
          We sent a password reset link to{' '}
          <span className={styles.emailAddress}>{getValues('email')}</span>.
          It may take a minute to arrive.
        </p>

        <div
          className={`${styles.alert} ${styles.alertSuccess}`}
          role="status"
        >
          <CheckCircle2 size={15} aria-hidden="true" />
          Reset link sent successfully.
        </div>

        <p className={styles.footer} style={{ marginTop: '1.5rem' }}>
          <Link href="/login">
            <ArrowLeft
              size={13}
              style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}
              aria-hidden="true"
            />
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Logo size="lg" />
      </div>

      <h1 className={styles.heading}>Forgot your password?</h1>
      <p className={styles.subheading}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {serverError && (
        <div className={`${styles.alert} ${styles.alertError}`} role="alert">
          <AlertCircle size={15} aria-hidden="true" />
          {serverError}
        </div>
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
          required
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            hasError={!!errors.email}
            leftIcon={<Mail size={16} />}
            {...register('email')}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className={styles.submitBtn}
        >
          Send reset link
        </Button>
      </form>

      <p className={styles.footer}>
        <Link href="/login">
          <ArrowLeft
            size={13}
            style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}
            aria-hidden="true"
          />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

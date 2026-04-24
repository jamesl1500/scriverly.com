'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

import { loginSchema, type LoginFormValues } from '@/libs/validations/auth';
import { Button, Input, FormField, Logo } from '@/components/ui';
import { loginUser, getAuthError } from '@/services/authService';
import styles from '@/styles/layouts/auth-layout.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/dashboard');
    }
  }, [shouldRedirect, router]);

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await loginUser(values);
      setShouldRedirect(true);
    } catch (err) {
      setServerError(getAuthError(err));
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Logo size="lg" />
      </div>

      <h1 className={styles.heading}>Welcome back</h1>
      <p className={styles.subheading}>Sign in to your Scriverly account</p>

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

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          required
          labelAction={
            <Link
              href="/forgot_password"
              className={styles.footer}
              style={{ marginTop: 0 }}
              tabIndex={0}
            >
              Forgot password?
            </Link>
          }
        >
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            hasError={!!errors.password}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 2px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'inherit',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register('password')}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className={styles.submitBtn}
        >
          Sign in
        </Button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/signup">Create one for free</Link>
      </p>
    </div>
  );
}

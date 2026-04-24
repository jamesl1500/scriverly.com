'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { signupSchema, type SignupFormValues } from '@/libs/validations/auth';
import { Button, Input, FormField, Logo } from '@/components/ui';
import { signupUser, getAuthError } from '@/services/authService';
import styles from '@/styles/layouts/auth-layout.module.scss';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);
    try {
      const result = await signupUser(values);
      if (result.data?.requiresEmailConfirmation) {
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setServerError(getAuthError(err));
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Logo size="lg" />
      </div>

      <h1 className={styles.heading}>Create your account</h1>
      <p className={styles.subheading}>
        Start writing smarter essays today
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
          label="Full name"
          htmlFor="fullName"
          error={errors.fullName?.message}
          required
        >
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            hasError={!!errors.fullName}
            leftIcon={<User size={16} />}
            {...register('fullName')}
          />
        </FormField>

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
          hint="At least 8 characters"
          required
        >
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Create a strong password"
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

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repeat your password"
            hasError={!!errors.confirmPassword}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirm((v) => !v)}
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
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register('confirmPassword')}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          className={styles.submitBtn}
        >
          Create account
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}

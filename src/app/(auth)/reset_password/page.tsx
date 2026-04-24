'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/libs/validations/auth';
import { Button, Input, FormField, Logo } from '@/components/ui';
import { resetPassword, getAuthError } from '@/services/authService';
import styles from '@/styles/layouts/auth-layout.module.scss';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null);
    try {
      await resetPassword(values);
      router.push('/login?reset=success');
    } catch (err) {
      setServerError(getAuthError(err));
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Logo size="lg" />
      </div>

      <h1 className={styles.heading}>Set a new password</h1>
      <p className={styles.subheading}>
        Create a strong password for your Scriverly account.
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
          label="New password"
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
          label="Confirm new password"
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
          Update password
        </Button>
      </form>
    </div>
  );
}

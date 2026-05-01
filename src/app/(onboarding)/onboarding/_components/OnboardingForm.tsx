'use client';

import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, CheckCircle, Loader2, AlertCircle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FormField from '@/components/ui/FormField/FormField';
import Input from '@/components/ui/Input/Input';
import apiClient from '@/libs/apiClient';
import {
  onboardingProfileSchema,
  type OnboardingProfileInput,
} from '@/libs/validations/onboarding';
import styles from '@/styles/components/OnboardingForm.module.scss';

interface OnboardingFormProps {
  initialData: {
    fullName: string;
    username: string;
    avatarUrl: string;
    bio: string;
  };
}

export default function OnboardingForm({ initialData }: OnboardingFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(initialData.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingProfileInput>({
    resolver: zodResolver(onboardingProfileSchema),
    defaultValues: {
      fullName: initialData.fullName,
      username: initialData.username,
      bio: initialData.bio,
    },
  });

  const bioValue = useWatch({ control, name: 'bio', defaultValue: '' }) ?? '';

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  }

  async function onSubmit(data: OnboardingProfileInput) {
    setServerError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('username', data.username);
    if (data.bio) formData.append('bio', data.bio);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      await apiClient.patch('/onboarding/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Something went wrong. Please try again.';
      setServerError(message);
    }
  }

  return (
    <div className={styles.card}>
      <p className={styles.eyebrow}>Welcome to Scriverly</p>
      <h1 className={styles.heading}>Set up your profile</h1>
      <p className={styles.subheading}>
        Tell us a little about yourself. You can change this any time.
      </p>

      {/* Avatar picker */}
      <div className={styles.avatarSection}>
        <button
          type="button"
          className={styles.avatarButton}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload avatar"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarPlaceholder}>
              <User size={28} />
            </span>
          )}
          <span className={styles.avatarOverlay} aria-hidden="true">
            <Camera size={18} />
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleAvatarChange}
        />

        <div className={styles.avatarMeta}>
          <span className={styles.avatarLabel}>Profile photo</span>
          <span className={styles.avatarHint}>JPG, PNG, or WebP · Max 2 MB</span>
        </div>
      </div>

      {/* Form fields */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.fields}>
          <FormField
            label="Full name"
            htmlFor="fullName"
            error={errors.fullName?.message}
            required
          >
            <Input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              hasError={!!errors.fullName}
              {...register('fullName')}
            />
          </FormField>

          <FormField
            label="Username"
            htmlFor="username"
            error={errors.username?.message}
            hint="Letters, numbers, underscores, and hyphens only."
            required
          >
            <Input
              id="username"
              type="text"
              placeholder="janedoe"
              autoComplete="username"
              hasError={!!errors.username}
              {...register('username')}
            />
          </FormField>

          <FormField label="Bio" htmlFor="bio" error={errors.bio?.message}>
            <textarea
              id="bio"
              placeholder="A short bio about yourself…"
              className={[
                styles.textarea,
                errors.bio ? styles.textareaError : '',
              ]
                .filter(Boolean)
                .join(' ')}
              {...register('bio')}
            />
            <p
              className={[
                styles.charCount,
                bioValue.length > 450 ? styles.charCountWarn : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {bioValue.length} / 500
            </p>
          </FormField>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Saving…
              </>
            ) : (
              'Save and continue'
            )}
          </button>
        </div>

        {success && (
          <div className={styles.successBanner} role="status">
            <CheckCircle size={16} aria-hidden="true" />
            Profile saved successfully!
          </div>
        )}

        {serverError && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            {serverError}
          </div>
        )}
      </form>
    </div>
  );
}

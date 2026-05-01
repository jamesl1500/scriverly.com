'use client';

import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, AlertCircle, Camera, Loader2 } from 'lucide-react';
import type { AxiosError } from 'axios';

import {
  profileSchema,
  type ProfileFormValues,
  ACADEMIC_LEVELS,
} from '@/libs/validations/user';
import { Button, Input, FormField } from '@/components/ui';
import apiClient from '@/libs/apiClient';
import type { ApiErrorResponse } from '@/libs/apiHelpers';
import styles from '@/styles/components/Profile.module.scss';

interface ProfileFormProps {
  initialValues: ProfileFormValues;
  email: string;
  role: string;
  avatarUrl: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Admin',
};

export default function ProfileForm({
  initialValues,
  email,
  role,
  avatarUrl,
  createdAt,
}: ProfileFormProps) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [liveAvatarUrl, setLiveAvatarUrl] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const body = new FormData();
    body.append('avatar', file);

    try {
      const res = await fetch('/api/user/avatar', { method: 'PATCH', body });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? 'Upload failed.');
      } else {
        // Bust the cache so the new image loads immediately
        setLiveAvatarUrl(`${json.data.avatarUrl}?t=${Date.now()}`);
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });

  const displayName = useWatch({ control, name: 'full_name', defaultValue: initialValues.full_name }) || email;
  const bioValue = useWatch({ control, name: 'bio', defaultValue: '' }) ?? '';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || email[0]?.toUpperCase() || '?';

  const memberSince = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    setSuccess(false);
    try {
      await apiClient.put('/user/profile', values);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setServerError(
        axiosErr?.response?.data?.error ?? 'Something went wrong. Please try again.',
      );
    }
  }

  return (
    <form
      className={styles.profileGrid}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {/* ── Left: Avatar + Identity sidebar ── */}
      <aside className={styles.avatarPanel}>
        <div className={styles.avatarWrap}>
          {liveAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={liveAvatarUrl}
              alt={displayName}
              className={styles.avatarCircle}
            />
          ) : (
            <div className={styles.avatarCircle} aria-hidden="true">
              {initials}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            aria-hidden="true"
            onChange={handleAvatarChange}
          />

          <button
            type="button"
            className={styles.avatarChangeBtn}
            aria-label="Change profile photo"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 size={13} className={styles.spinning} aria-hidden="true" />
            ) : (
              <Camera size={13} aria-hidden="true" />
            )}
            {uploading ? 'Uploading…' : 'Change photo'}
          </button>

          {uploadError && (
            <p className={styles.uploadError} role="alert">
              {uploadError}
            </p>
          )}
        </div>

        <div className={styles.identityCard}>
          <p className={styles.identityName}>{displayName}</p>
          <p className={styles.identityEmail}>{email}</p>
          <span
            className={[
              styles.roleBadge,
              styles[`role_${role}` as keyof typeof styles] ?? '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>

        <dl className={styles.metaList}>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Member since</dt>
            <dd className={styles.metaValue}>{memberSince}</dd>
          </div>
        </dl>
      </aside>

      {/* ── Right: Form ── */}
      <div className={styles.formArea}>
        {success && (
          <div
            className={`${styles.alert} ${styles.alertSuccess}`}
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            Profile updated successfully.
          </div>
        )}
        {serverError && (
          <div
            className={`${styles.alert} ${styles.alertError}`}
            role="alert"
          >
            <AlertCircle size={15} aria-hidden="true" />
            {serverError}
          </div>
        )}

        {/* Personal information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Personal information</h2>
          <p className={styles.sectionDesc}>
            Your display name, username, and public bio.
          </p>
          <div className={styles.formGrid}>
            <FormField
              label="Full name"
              htmlFor="full_name"
              error={errors.full_name?.message}
              required
            >
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="Alex Johnson"
                hasError={!!errors.full_name}
                {...register('full_name')}
              />
            </FormField>

            <FormField
              label="Username"
              htmlFor="username"
              error={errors.username?.message}
              hint="Letters, numbers, _ and - only."
            >
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="alex_johnson"
                hasError={!!errors.username}
                {...register('username')}
              />
            </FormField>

            <div className={styles.spanFull}>
              <FormField
                label="Bio"
                htmlFor="bio"
                error={errors.bio?.message}
                hint={`${bioValue.length} / 500`}
              >
                <textarea
                  id="bio"
                  rows={4}
                  className={[
                    styles.textarea,
                    errors.bio ? styles.textareaError : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  placeholder="Tell others about yourself — your interests, writing focus, or academic goals."
                  {...register('bio')}
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* Academic profile */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Academic profile</h2>
          <p className={styles.sectionDesc}>
            Used to tailor feedback and citation suggestions to your level and field.
          </p>
          <div className={styles.formGrid}>
            <FormField
              label="Institution"
              htmlFor="institution"
              error={errors.institution?.message}
            >
              <Input
                id="institution"
                type="text"
                placeholder="Stanford University"
                hasError={!!errors.institution}
                {...register('institution')}
              />
            </FormField>

            <FormField
              label="Department"
              htmlFor="department"
              error={errors.department?.message}
            >
              <Input
                id="department"
                type="text"
                placeholder="Department of English"
                hasError={!!errors.department}
                {...register('department')}
              />
            </FormField>

            <FormField label="Academic level" htmlFor="academic_level">
              <div className={styles.selectWrap}>
                <select
                  id="academic_level"
                  className={styles.select}
                  {...register('academic_level')}
                >
                  {ACADEMIC_LEVELS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
          </div>
        </section>

        {/* Actions */}
        <div className={styles.formActions}>
          <Button
            type="submit"
            size="md"
            isLoading={isSubmitting}
            disabled={!isDirty}
          >
            Save changes
          </Button>
          {isDirty && !isSubmitting && (
            <p className={styles.unsavedHint} aria-live="polite">
              You have unsaved changes.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sliders,
  UserCog,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  MonitorX,
  TriangleAlert,
} from 'lucide-react';
import type { AxiosError } from 'axios';

import {
  settingsSchema,
  type SettingsFormValues,
  CITATION_STYLES,
  ESSAY_TYPES,
} from '@/libs/validations/user';
import { Button } from '@/components/ui';
import FormField from '@/components/ui/FormField/FormField';
import apiClient from '@/libs/apiClient';
import type { ApiErrorResponse } from '@/libs/apiHelpers';
import styles from '@/styles/components/Settings.module.scss';

type TabId = 'preferences' | 'account' | 'danger';

interface SettingsContentProps {
  email: string;
  emailVerified: boolean;
  initialValues: SettingsFormValues;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }> }[] = [
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'account', label: 'Account', icon: UserCog },
  { id: 'danger', label: 'Danger zone', icon: ShieldAlert },
];

export default function SettingsContent({
  email,
  emailVerified,
  initialValues,
}: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('preferences');

  return (
    <div className={styles.settingsGrid}>
      {/* ── Tab Nav ── */}
      <nav className={styles.tabNav} aria-label="Settings sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={[
              styles.tabBtn,
              activeTab === id ? styles.tabBtnActive : '',
              id === 'danger' ? styles.tabBtnDanger : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      {/* ── Tab Content ── */}
      <div className={styles.tabContent}>
        {activeTab === 'preferences' && (
          <PreferencesTab initialValues={initialValues} />
        )}
        {activeTab === 'account' && (
          <AccountTab email={email} emailVerified={emailVerified} />
        )}
        {activeTab === 'danger' && <DangerTab />}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Preferences Tab
// ──────────────────────────────────────────

function PreferencesTab({ initialValues }: { initialValues: SettingsFormValues }) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: SettingsFormValues) {
    setServerError(null);
    setSuccess(false);
    try {
      await apiClient.put('/user/settings', values);
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
    <>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Writing defaults</h2>
          <p className={styles.sectionDesc}>
            Applied automatically when you create a new essay. You can always
            override these per essay.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.sectionBody}>
            {success && (
              <div
                className={`${styles.alert} ${styles.alertSuccess}`}
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 size={15} aria-hidden="true" />
                Preferences saved.
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

            <div className={styles.prefGrid}>
              <FormField
                label="Default citation style"
                htmlFor="default_citation_style"
              >
                <div className={styles.selectWrap}>
                  <select
                    id="default_citation_style"
                    className={styles.select}
                    {...register('default_citation_style')}
                  >
                    {CITATION_STYLES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>

              <FormField
                label="Default essay type"
                htmlFor="default_essay_type"
              >
                <div className={styles.selectWrap}>
                  <select
                    id="default_essay_type"
                    className={styles.select}
                    {...register('default_essay_type')}
                  >
                    {ESSAY_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="submit"
              size="md"
              isLoading={isSubmitting}
              disabled={!isDirty}
            >
              Save preferences
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

// ──────────────────────────────────────────
// Account Tab
// ──────────────────────────────────────────

function AccountTab({
  email,
  emailVerified,
}: {
  email: string;
  emailVerified: boolean;
}) {
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOutAll() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await apiClient.post('/auth/signout-all', {});
    } catch {
      setSignOutError('Failed to sign out other sessions. Try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <p className={styles.sectionDesc}>
            Manage your email address, password, and active sessions.
          </p>
        </div>

        {/* Email row */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} aria-hidden="true" style={{ color: 'var(--color-text-muted, #9C9087)', flexShrink: 0 }} />
              <span className={styles.fieldLabel}>Email address</span>
            </div>
            <span className={styles.fieldMeta}>{email}</span>
          </div>
          <div className={styles.fieldActions}>
            <span
              className={[
                styles.fieldBadge,
                emailVerified ? styles.badgeVerified : styles.badgeUnverified,
              ].join(' ')}
            >
              {emailVerified ? (
                <>
                  <CheckCircle2 size={11} aria-hidden="true" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle size={11} aria-hidden="true" />
                  Unverified
                </>
              )}
            </span>
          </div>
        </div>

        {/* Password row */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={14} aria-hidden="true" style={{ color: 'var(--color-text-muted, #9C9087)', flexShrink: 0 }} />
              <span className={styles.fieldLabel}>Password</span>
            </div>
            <span className={styles.fieldMeta}>
              Send a reset link to change your password.
            </span>
          </div>
          <div className={styles.fieldActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void apiClient.post('/auth/forgot-password', { email });
              }}
            >
              Change password
            </Button>
          </div>
        </div>

        {/* Sessions row */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MonitorX size={14} aria-hidden="true" style={{ color: 'var(--color-text-muted, #9C9087)', flexShrink: 0 }} />
              <span className={styles.fieldLabel}>Active sessions</span>
            </div>
            <span className={styles.fieldMeta}>
              Sign out of all other devices and browsers.
            </span>
            {signOutError && (
              <p style={{ fontSize: '0.75rem', color: '#D44949', marginTop: '4px' }}>
                {signOutError}
              </p>
            )}
          </div>
          <div className={styles.fieldActions}>
            <Button
              variant="ghost"
              size="sm"
              isLoading={signingOut}
              onClick={handleSignOutAll}
            >
              Sign out all
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────
// Danger Zone Tab
// ──────────────────────────────────────────

function DangerTab() {
  return (
    <>
      <div className={styles.dangerSection}>
        <div className={styles.dangerHead}>
          <h2 className={styles.dangerTitle}>Danger zone</h2>
          <p className={styles.dangerDesc}>
            These actions are irreversible. Please proceed with caution.
          </p>
        </div>

        <div className={styles.dangerBody}>
          {/* Export data */}
          <div className={styles.dangerRow}>
            <div className={styles.dangerRowInfo}>
              <p className={styles.dangerRowLabel}>Export your data</p>
              <p className={styles.dangerRowDesc}>
                Download all your essays, feedback reports, and profile data as
                a ZIP archive.
              </p>
            </div>
            <Button variant="ghost" size="sm" disabled>
              Export data
            </Button>
          </div>

          {/* Delete account */}
          <div className={styles.dangerRow}>
            <div className={styles.dangerRowInfo}>
              <p className={styles.dangerRowLabel}>Delete account</p>
              <p className={styles.dangerRowDesc}>
                Permanently delete your account, all essays, feedback, and
                citations. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              <TriangleAlert size={14} aria-hidden="true" />
              Delete account
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`${styles.alert} ${styles.alertError}`}
        role="note"
        style={{ marginTop: 0 }}
      >
        <AlertCircle size={15} aria-hidden="true" />
        Account deletion is currently disabled. Contact{' '}
        <a
          href="mailto:support@scriverly.com"
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          support@scriverly.com
        </a>{' '}
        to request removal.
      </div>
    </>
  );
}

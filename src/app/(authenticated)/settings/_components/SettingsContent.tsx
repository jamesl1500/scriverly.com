'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  CreditCard,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { AxiosError } from 'axios';

import {
  settingsSchema,
  changeEmailSchema,
  changePasswordSchema,
  type SettingsFormValues,
  type ChangeEmailValues,
  type ChangePasswordValues,
  CITATION_STYLES,
  ESSAY_TYPES,
} from '@/libs/validations/user';
import { Button, Input } from '@/components/ui';
import FormField from '@/components/ui/FormField/FormField';
import apiClient from '@/libs/apiClient';
import type { ApiErrorResponse } from '@/libs/apiHelpers';
import { useCurrentPlan } from '@/libs/hooks/useCurrentPlan';
import styles from '@/styles/components/Settings.module.scss';

type TabId = 'preferences' | 'account' | 'billing' | 'danger';

interface SettingsContentProps {
  email: string;
  emailVerified: boolean;
  initialValues: SettingsFormValues;
  billingStatus?: 'success' | 'cancelled';
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }> }[] = [
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'account',     label: 'Account',     icon: UserCog },
  { id: 'billing',     label: 'Billing',     icon: CreditCard },
  { id: 'danger',      label: 'Danger zone', icon: ShieldAlert },
];

export default function SettingsContent({
  email,
  emailVerified,
  initialValues,
  billingStatus,
}: SettingsContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>(
    billingStatus ? 'billing' : 'preferences',
  );

  // Clean the ?billing= param from the URL after mount
  useEffect(() => {
    if (billingStatus) {
      router.replace('/settings', { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {activeTab === 'billing' && <BillingTab billingStatus={billingStatus} />}
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
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
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
        <div>
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
                  <><CheckCircle2 size={11} aria-hidden="true" />Verified</>
                ) : (
                  <><AlertCircle size={11} aria-hidden="true" />Unverified</>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingEmail((v) => !v);
                  setEditingPassword(false);
                }}
              >
                {editingEmail ? 'Cancel' : 'Change email'}
              </Button>
            </div>
          </div>
          {editingEmail && (
            <ChangeEmailForm
              currentEmail={email}
              onDone={() => setEditingEmail(false)}
            />
          )}
        </div>

        {/* Password row */}
        <div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={14} aria-hidden="true" style={{ color: 'var(--color-text-muted, #9C9087)', flexShrink: 0 }} />
                <span className={styles.fieldLabel}>Password</span>
              </div>
              <span className={styles.fieldMeta}>
                Update the password used to sign in.
              </span>
            </div>
            <div className={styles.fieldActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingPassword((v) => !v);
                  setEditingEmail(false);
                }}
              >
                {editingPassword ? 'Cancel' : 'Change password'}
              </Button>
            </div>
          </div>
          {editingPassword && (
            <ChangePasswordForm onDone={() => setEditingPassword(false)} />
          )}
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
// Change Email inline form
// ──────────────────────────────────────────

function ChangeEmailForm({
  currentEmail,
  onDone,
}: {
  currentEmail: string;
  onDone: () => void;
}) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
  });

  async function onSubmit(values: ChangeEmailValues) {
    setServerError(null);
    setSuccess(false);
    try {
      await apiClient.post('/user/change-email', values);
      setSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setServerError(
        axiosErr?.response?.data?.error ?? 'Something went wrong. Please try again.',
      );
    }
  }

  if (success) {
    return (
      <div className={styles.fieldPanel}>
        <div className={`${styles.fieldPanelAlert} ${styles.fieldPanelSuccess}`}>
          <CheckCircle2 size={14} aria-hidden="true" />
          Confirmation sent to your new address. Click the link to complete the change.
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <Button variant="ghost" size="sm" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fieldPanel}>
      <form
        className={styles.fieldPanelForm}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {serverError && (
          <div className={`${styles.fieldPanelAlert} ${styles.fieldPanelError}`} role="alert">
            <AlertCircle size={14} aria-hidden="true" />
            {serverError}
          </div>
        )}

        <FormField
          label="New email address"
          htmlFor="newEmail"
          error={errors.newEmail?.message}
          hint={`Currently: ${currentEmail}`}
        >
          <Input
            id="newEmail"
            type="email"
            autoComplete="email"
            placeholder="new@example.com"
            hasError={!!errors.newEmail}
            {...register('newEmail')}
          />
        </FormField>

        <div className={styles.fieldPanelActions}>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Send confirmation
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────
// Change Password inline form
// ──────────────────────────────────────────

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordValues) {
    setServerError(null);
    setSuccess(false);
    try {
      await apiClient.post('/user/change-password', values);
      setSuccess(true);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setServerError(
        axiosErr?.response?.data?.error ?? 'Something went wrong. Please try again.',
      );
    }
  }

  if (success) {
    return (
      <div className={styles.fieldPanel}>
        <div className={`${styles.fieldPanelAlert} ${styles.fieldPanelSuccess}`}>
          <CheckCircle2 size={14} aria-hidden="true" />
          Password updated. Other active sessions have been signed out.
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <Button variant="ghost" size="sm" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fieldPanel}>
      <form
        className={styles.fieldPanelForm}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {serverError && (
          <div className={`${styles.fieldPanelAlert} ${styles.fieldPanelError}`} role="alert">
            <AlertCircle size={14} aria-hidden="true" />
            {serverError}
          </div>
        )}

        <FormField
          label="Current password"
          htmlFor="currentPassword"
          error={errors.currentPassword?.message}
        >
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            hasError={!!errors.currentPassword}
            {...register('currentPassword')}
          />
        </FormField>

        <FormField
          label="New password"
          htmlFor="newPassword"
          error={errors.newPassword?.message}
          hint="At least 8 characters."
        >
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            hasError={!!errors.newPassword}
            {...register('newPassword')}
          />
        </FormField>

        <FormField
          label="Confirm new password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            hasError={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

        <div className={styles.fieldPanelActions}>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Update password
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
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

// ──────────────────────────────────────────
// Billing Tab
// ──────────────────────────────────────────

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit ? Math.min(100, (used / limit) * 100) : 0;
  const atLimit = limit !== null && used >= limit;
  return (
    <div className={styles.billingUsageRow}>
      <div className={styles.billingUsageLabels}>
        <span>{label}</span>
        <span style={{ color: atLimit ? '#D44949' : undefined }}>
          {limit === null ? 'Unlimited' : `${used} / ${limit}`}
        </span>
      </div>
      {limit !== null && (
        <div className={styles.billingUsageTrack}>
          <div
            className={styles.billingUsageFill}
            style={{
              width: `${pct}%`,
              backgroundColor: atLimit ? '#D44949' : '#C8854A',
            }}
          />
        </div>
      )}
    </div>
  );
}

function BillingTab({ billingStatus }: { billingStatus?: 'success' | 'cancelled' }) {
  const { data: plan, isLoading } = useCurrentPlan();
  const isPremium = plan?.plan === 'premium';

  return (
    <>
      {billingStatus === 'success' && (
        <div className={`${styles.alert} ${styles.alertSuccess}`} role="status" aria-live="polite">
          <CheckCircle2 size={15} aria-hidden="true" />
          You&apos;re now on Premium! Enjoy unlimited AI analyses and outline generations.
        </div>
      )}
      {billingStatus === 'cancelled' && (
        <div className={`${styles.alert} ${styles.alertError}`} role="status" aria-live="polite">
          <AlertCircle size={15} aria-hidden="true" />
          Checkout was cancelled — you haven&apos;t been charged.
        </div>
      )}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Subscription</h2>
          <p className={styles.sectionDesc}>Manage your plan and AI usage.</p>
        </div>

        <div className={styles.sectionBody}>
          {isLoading && <p className={styles.muted}>Loading…</p>}

          {!isLoading && plan && (
            <>
              {/* Plan badge */}
              <div className={styles.billingPlanRow}>
                <div className={styles.billingPlanBadge} data-premium={isPremium}>
                  {isPremium ? (
                    <><Sparkles size={13} aria-hidden="true" /> Premium</>
                  ) : (
                    <><Zap size={13} aria-hidden="true" /> Free</>
                  )}
                </div>
                <span className={styles.billingPlanDesc}>
                  {isPremium
                    ? 'Unlimited AI analyses and outline generations.'
                    : 'Limited AI usage — resets each calendar month.'}
                </span>
              </div>

              {/* Usage this month */}
              {!isPremium && (
                <div className={styles.billingUsageBlock}>
                  <p className={styles.billingUsageTitle}>This month&apos;s usage</p>
                  <UsageBar
                    label="AI analyses"
                    used={plan.analysis.used}
                    limit={plan.analysis.limit}
                  />
                  <UsageBar
                    label="Outline generations"
                    used={plan.outline.used}
                    limit={plan.outline.limit}
                  />
                </div>
              )}

              {/* CTA */}
              {!isPremium && (
                <form method="POST" action="/api/billing/checkout">
                  <button type="submit" className={styles.billingUpgradeBtn}>
                    <Sparkles size={14} aria-hidden="true" />
                    Upgrade to Premium — $9/mo
                  </button>
                </form>
              )}

              {isPremium && (
                <form method="POST" action="/api/billing/portal">
                  <button type="submit" className={styles.billingPortalBtn}>
                    <CreditCard size={14} aria-hidden="true" />
                    Manage subscription
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

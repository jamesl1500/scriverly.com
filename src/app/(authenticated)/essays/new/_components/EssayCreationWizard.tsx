'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import type { AxiosError } from 'axios';

import {
  createEssaySchema,
  type CreateEssayValues,
  essayStep1Schema,
  essayStep2Schema,
  ESSAY_TYPES,
  ACADEMIC_LEVELS,
  CITATION_STYLES,
} from '@/libs/validations/essay';
import { Button, Input, FormField } from '@/components/ui';
import apiClient from '@/libs/apiClient';
import type { ApiErrorResponse } from '@/libs/apiHelpers';
import styles from '@/styles/components/EssayWizard.module.scss';

// ── Step meta ──────────────────────────────────────────────

const STEPS = [
  {
    id: 1,
    label: 'Details',
    title: 'Set the stage',
    desc: "Name your essay and describe what you're writing about. This context helps the AI give you precise feedback.",
  },
  {
    id: 2,
    label: 'Configure',
    title: 'Configure your essay',
    desc: 'Choose the essay type, academic level, and citation style. These shape how Scriverly assists you.',
  },
  {
    id: 3,
    label: 'Goals',
    title: 'Set your goals',
    desc: 'Add a word count target, due date, and decide whether to start from an AI-generated outline.',
  },
] as const;

// ── Step-level field names used for per-step validation ──

const STEP_FIELDS: Record<number, (keyof CreateEssayValues)[]> = {
  1: ['title', 'subject', 'summary'],
  2: ['essay_type', 'academic_level', 'citation_style'],
};

// ── Component ──────────────────────────────────────────────

export default function EssayCreationWizard() {
  const router = useRouter();
  const [step, setStep]               = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateEssayValues>({
    resolver: zodResolver(createEssaySchema),
    defaultValues: {
      title:              '',
      subject:            '',
      summary:            '',
      essay_type:         'argumentative',
      academic_level:     'undergraduate',
      citation_style:     'APA',
      word_goal:          undefined,
      due_date:           '',
      start_with_outline: false,
    },
  });

  const startWithOutline = watch('start_with_outline');
  const summaryValue     = watch('summary') ?? '';

  // ── Navigation ──────────────────────────────────────────

  async function handleNext() {
    const fields = STEP_FIELDS[step];
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep(s => s + 1);
  }

  function handleBack() {
    setStep(s => s - 1);
    setServerError(null);
  }

  // ── Submit (step 3) ──────────────────────────────────────

  async function onSubmit(values: CreateEssayValues) {
    setServerError(null);
    try {
      const { data } = await apiClient.post('/essays', values);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const essay = (data as any).data?.essay;
      router.push(`/essays/${essay.id as string}`);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      setServerError(
        axiosErr?.response?.data?.error ?? 'Failed to create essay. Please try again.',
      );
    }
  }

  const currentStep = STEPS.find(s => s.id === step)!;

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Step Indicator ────────────────────────── */}
        <div className={styles.stepIndicator} role="list" aria-label="Progress">
          {STEPS.map((s, idx) => {
            const isDone   = step > s.id;
            const isActive = step === s.id;
            return (
              <div
                key={s.id}
                className={`${styles.stepItem} ${isActive ? styles.stepItemActive : ''} ${isDone ? styles.stepItemDone : ''}`}
                role="listitem"
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className={`${styles.stepCircle} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}
                  aria-hidden="true"
                >
                  {isDone ? <Check size={12} strokeWidth={3} /> : s.id}
                </div>
                <span className={styles.stepLabel}>{s.label}</span>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`${styles.stepConnector} ${isDone ? styles.stepConnectorDone : ''}`}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step Header ───────────────────────────── */}
        <div className={styles.stepHeader}>
          <h1 className={styles.stepTitle}>{currentStep.title}</h1>
          <p className={styles.stepDesc}>{currentStep.desc}</p>
        </div>

        {/* ── Step Body ─────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className={styles.stepBody} key="step1">
              <FormField
                label="Essay title"
                htmlFor="title"
                error={errors.title?.message}
                required
              >
                <Input
                  id="title"
                  type="text"
                  autoFocus
                  placeholder="The Ethics of Artificial Intelligence"
                  hasError={!!errors.title}
                  {...register('title')}
                />
              </FormField>

              <FormField
                label="Subject"
                htmlFor="subject"
                error={errors.subject?.message}
                hint="Used by AI to understand what you're writing about."
                required
              >
                <Input
                  id="subject"
                  type="text"
                  placeholder="AI ethics, bias in machine learning, algorithmic fairness"
                  hasError={!!errors.subject}
                  {...register('subject')}
                />
              </FormField>

              <FormField
                label="Summary or prompt"
                htmlFor="summary"
                error={errors.summary?.message}
                hint={`${summaryValue.length} / 1000 — Optional. Describe your thesis, angle, or paste an assignment prompt.`}
              >
                <textarea
                  id="summary"
                  rows={4}
                  className={`${styles.textarea} ${errors.summary ? styles.textareaError : ''}`}
                  placeholder="Briefly describe what you want to argue or explore. The more detail you provide, the better the AI assistance will be."
                  {...register('summary')}
                />
              </FormField>
            </div>
          )}

          {/* Step 2 — Configuration */}
          {step === 2 && (
            <div className={styles.stepBody} key="step2">
              <div className={styles.formGrid}>
                <div className={styles.spanFull}>
                  <FormField label="Essay type" htmlFor="essay_type">
                    <div className={styles.selectWrap}>
                      <select
                        id="essay_type"
                        className={styles.select}
                        {...register('essay_type')}
                      >
                        {ESSAY_TYPES.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </FormField>
                </div>

                <FormField label="Academic level" htmlFor="academic_level">
                  <div className={styles.selectWrap}>
                    <select
                      id="academic_level"
                      className={styles.select}
                      {...register('academic_level')}
                    >
                      {ACADEMIC_LEVELS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </FormField>

                <FormField label="Citation style" htmlFor="citation_style">
                  <div className={styles.selectWrap}>
                    <select
                      id="citation_style"
                      className={styles.select}
                      {...register('citation_style')}
                    >
                      {CITATION_STYLES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </FormField>
              </div>
            </div>
          )}

          {/* Step 3 — Goals */}
          {step === 3 && (
            <div className={styles.stepBody} key="step3">
              {serverError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#FFF2F2',
                    border: '1px solid #EF9090',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    color: '#D44949',
                  }}
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <div className={styles.formGrid}>
                <FormField
                  label="Word goal"
                  htmlFor="word_goal"
                  error={errors.word_goal?.message}
                  hint="Optional — set a target to track progress."
                >
                  <div className={styles.numberInput}>
                    <input
                      id="word_goal"
                      type="number"
                      min={1}
                      placeholder="2000"
                      {...register('word_goal', { valueAsNumber: true })}
                    />
                    <span className={styles.inputUnit}>words</span>
                  </div>
                </FormField>

                <FormField
                  label="Due date"
                  htmlFor="due_date"
                  error={errors.due_date?.message}
                  hint="Optional."
                >
                  <Input
                    id="due_date"
                    type="date"
                    hasError={!!errors.due_date}
                    {...register('due_date')}
                  />
                </FormField>
              </div>

              {/* Start with outline toggle */}
              <div>
                <button
                  type="button"
                  className={`${styles.toggleRow} ${startWithOutline ? styles.toggleRowActive : ''}`}
                  onClick={() => setValue('start_with_outline', !startWithOutline, { shouldDirty: true })}
                  aria-pressed={startWithOutline}
                >
                  <div className={styles.toggleLabel}>
                    <span className={styles.toggleTitle}>
                      <Sparkles
                        size={14}
                        aria-hidden="true"
                        style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: '#C8854A' }}
                      />
                      Start with an AI outline
                    </span>
                    <span className={styles.toggleHint}>
                      Scriverly will generate a structured outline based on your topic and configuration before you start writing.
                    </span>
                  </div>
                  <div className={styles.toggleSwitchTrack} aria-hidden="true">
                    <div className={styles.toggleSwitchThumb} />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Navigation Footer ─────────────────── */}
          <div className={styles.wizardFooter}>
            <div>
              {step > 1 ? (
                <Button type="button" variant="ghost" size="md" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <span /> // spacer
              )}
            </div>

            <div className={styles.wizardFooterRight}>
              <span className={styles.stepCounter}>Step {step} of {STEPS.length}</span>

              {step < STEPS.length ? (
                <Button type="button" size="md" onClick={handleNext}>
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<Sparkles size={15} aria-hidden="true" />}
                >
                  Create essay
                </Button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

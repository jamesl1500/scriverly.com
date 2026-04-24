import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import styles from '@/styles/components/FormField.module.scss';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Slot for an inline link next to the label (e.g. "Forgot password?") */
  labelAction?: ReactNode;
  children: ReactNode;
}

export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  labelAction,
  children,
}: FormFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelAction}
      </div>

      {children}

      {hint && !error && <p className={styles.hint}>{hint}</p>}

      {error && (
        <p className={styles.error} role="alert" aria-live="polite">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

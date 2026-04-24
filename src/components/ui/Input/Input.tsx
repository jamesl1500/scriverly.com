'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import styles from '@/styles/components/Input.module.scss';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, hasError, disabled, className, ...props }, ref) => {
    const wrapperClasses = [
      styles.wrapper,
      leftIcon ? styles.hasLeft : '',
      rightIcon ? styles.hasRight : '',
      hasError ? styles.error : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {leftIcon && (
          <span className={styles.iconLeft} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={styles.input}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <span className={styles.iconRight}>{rightIcon}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;

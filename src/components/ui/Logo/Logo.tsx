import Link from 'next/link';
import styles from '@/styles/components/Logo.module.scss';

export type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  href?: string;
}

export default function Logo({ size = 'md', href = '/' }: LogoProps) {
  const classes = [styles.logo, styles[size]].join(' ');

  return (
    <Link href={href} className={classes} aria-label="Scriverly home">
      <span className={styles.icon} aria-hidden="true">
        {/* Quill-pen mark */}
        <svg
          width={size === 'lg' ? 20 : size === 'sm' ? 14 : 17}
          height={size === 'lg' ? 20 : size === 'sm' ? 14 : 17}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15.5 2C13 2 9.5 5 8 8L4.5 15.5L6 17L13.5 13C16.5 11.5 19 8 19 5.5C19 3.5 17.5 2 15.5 2Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          <path
            d="M4.5 15.5L3 18L5.5 16.5L4.5 15.5Z"
            fill="currentColor"
            fillOpacity="0.6"
          />
        </svg>
      </span>
      <span className={styles.wordmark}>Scriverly</span>
    </Link>
  );
}

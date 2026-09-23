import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Scriverly account password.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

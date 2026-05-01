import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email address to activate your Scriverly account.',
};

export default function VerifyEmailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

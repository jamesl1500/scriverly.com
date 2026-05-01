import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free Scriverly account and start writing better essays.',
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

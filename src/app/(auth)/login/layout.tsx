import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Sign in to your Scriverly account.',
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

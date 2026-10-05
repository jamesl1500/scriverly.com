import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/libs/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Sign Up',
  description: 'Create your free Scriverly account and start writing better essays.',
  path: '/signup',
});

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/libs/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Log In',
  description: 'Sign in to your Scriverly account.',
  path: '/login',
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

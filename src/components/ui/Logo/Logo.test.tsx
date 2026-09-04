import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import Logo from './Logo';

afterEach(cleanup);

describe('Logo', () => {
  it('renders a link with an accessible name', () => {
    render(<Logo />);
    expect(screen.getByRole('link', { name: 'Scriverly home' })).toBeInTheDocument();
  });

  it('renders the wordmark text', () => {
    render(<Logo />);
    expect(screen.getByText('Scriverly')).toBeInTheDocument();
  });

  it('links to /dashboard by default', () => {
    render(<Logo />);
    expect(screen.getByRole('link', { name: 'Scriverly home' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('links to a custom href when provided', () => {
    render(<Logo href="/home" />);
    expect(screen.getByRole('link', { name: 'Scriverly home' })).toHaveAttribute('href', '/home');
  });

  it('renders an svg icon mark', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders a larger svg icon for the lg size', () => {
    const { container: mdContainer } = render(<Logo size="md" />);
    const { container: lgContainer } = render(<Logo size="lg" />);

    const mdSvg = mdContainer.querySelector('svg');
    const lgSvg = lgContainer.querySelector('svg');

    expect(mdSvg).toHaveAttribute('width', '17');
    expect(lgSvg).toHaveAttribute('width', '20');
  });
});

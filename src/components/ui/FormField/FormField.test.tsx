import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import FormField from './FormField';

afterEach(cleanup);

describe('FormField', () => {
  it('renders the label text', () => {
    render(
      <FormField label="Email address" htmlFor="email">
        <input id="email" />
      </FormField>,
    );

    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  it('associates the label with its control via htmlFor/id', () => {
    render(
      <FormField label="Email address" htmlFor="email">
        <input id="email" />
      </FormField>,
    );

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('renders the required indicator when required is true', () => {
    render(
      <FormField label="Password" htmlFor="password" required>
        <input id="password" />
      </FormField>,
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders an error message when error is passed', () => {
    render(
      <FormField label="Email address" htmlFor="email" error="Email is required">
        <input id="email" />
      </FormField>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Email is required');
  });

  it('renders a hint when no error is present', () => {
    render(
      <FormField label="Email address" htmlFor="email" hint="We will never share your email">
        <input id="email" />
      </FormField>,
    );

    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hides the hint in favor of the error when both are provided', () => {
    render(
      <FormField
        label="Email address"
        htmlFor="email"
        hint="We will never share your email"
        error="Email is required"
      >
        <input id="email" />
      </FormField>,
    );

    expect(screen.queryByText('We will never share your email')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  it('renders a labelAction slot when provided', () => {
    render(
      <FormField
        label="Password"
        htmlFor="password"
        labelAction={<a href="/forgot">Forgot password?</a>}
      >
        <input id="password" />
      </FormField>,
    );

    expect(screen.getByRole('link', { name: 'Forgot password?' })).toBeInTheDocument();
  });
});

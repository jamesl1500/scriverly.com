import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './Input';
import styles from '@/styles/components/Input.module.scss';

afterEach(cleanup);

describe('Input', () => {
  it('renders with a placeholder', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('renders with a given value', () => {
    render(<Input value="hello" readOnly />);
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input placeholder="type here" onChange={handleChange} />);

    await user.type(screen.getByPlaceholderText('type here'), 'abc');

    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(screen.getByPlaceholderText('type here')).toHaveValue('abc');
  });

  it('respects the disabled prop', () => {
    render(<Input placeholder="disabled input" disabled />);
    expect(screen.getByPlaceholderText('disabled input')).toBeDisabled();
  });

  it('applies the error class to the wrapper when hasError is true', () => {
    render(<Input placeholder="err" hasError />);
    const wrapper = screen.getByPlaceholderText('err').parentElement;

    expect(wrapper).toHaveClass(styles.error);
  });

  it('does not apply the error class when hasError is false', () => {
    render(<Input placeholder="no-err" />);
    const wrapper = screen.getByPlaceholderText('no-err').parentElement;

    expect(wrapper).not.toHaveClass(styles.error);
  });

  it('renders left and right icons when provided', () => {
    render(<Input placeholder="icons" leftIcon={<span>L</span>} rightIcon={<span>R</span>} />);

    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('forwards the ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="ref input" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

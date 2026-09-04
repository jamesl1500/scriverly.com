import { describe, expect, it } from 'vitest';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from './auth';

describe('loginSchema', () => {
  it('parses a valid login payload', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anything',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing email', () => {
    const result = loginSchema.safeParse({ password: 'anything' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'anything',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('signupSchema', () => {
  const base = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'supersecret',
    confirmPassword: 'supersecret',
  };

  it('parses a valid signup payload', () => {
    const result = signupSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('rejects a fullName shorter than 2 characters', () => {
    const result = signupSchema.safeParse({ ...base, fullName: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects a fullName longer than 80 characters', () => {
    const result = signupSchema.safeParse({ ...base, fullName: 'A'.repeat(81) });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = signupSchema.safeParse({
      ...base,
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched password and confirmPassword', () => {
    const result = signupSchema.safeParse({
      ...base,
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('parses a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects a missing email', () => {
    const result = forgotPasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email format', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'nope' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('parses a valid matching password pair', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a password longer than 72 characters', () => {
    const longPassword = 'a'.repeat(73);
    const result = resetPasswordSchema.safeParse({
      password: longPassword,
      confirmPassword: longPassword,
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirmPassword: 'otherpassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty confirmPassword', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword123',
      confirmPassword: '',
    });
    expect(result.success).toBe(false);
  });
});

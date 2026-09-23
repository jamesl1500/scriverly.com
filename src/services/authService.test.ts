import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AxiosError } from 'axios';

vi.mock('@/libs/apiClient', () => ({
  default: { post: vi.fn() },
}));

import apiClient from '@/libs/apiClient';
import {
  forgotPassword,
  getAuthError,
  loginUser,
  resendVerification,
  resetPassword,
  signupUser,
} from './authService';

const mockedPost = vi.mocked(apiClient.post);

describe('authService', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('loginUser posts credentials to /auth/login and returns the response data', async () => {
    mockedPost.mockResolvedValue({ data: { success: true, data: { user: { id: '1' } } } });
    const values = { email: 'a@b.com', password: 'secret123' };

    const result = await loginUser(values);

    expect(mockedPost).toHaveBeenCalledWith('/auth/login', values);
    expect(result).toEqual({ success: true, data: { user: { id: '1' } } });
  });

  it('signupUser posts to /auth/signup and returns the response data', async () => {
    mockedPost.mockResolvedValue({ data: { success: true } });
    const values = {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    };

    const result = await signupUser(values);

    expect(mockedPost).toHaveBeenCalledWith('/auth/signup', values);
    expect(result).toEqual({ success: true });
  });

  it('forgotPassword posts to /auth/forgot-password and returns the response data', async () => {
    mockedPost.mockResolvedValue({ data: { success: true, data: { sent: true } } });
    const values = { email: 'a@b.com' };

    const result = await forgotPassword(values);

    expect(mockedPost).toHaveBeenCalledWith('/auth/forgot-password', values);
    expect(result).toEqual({ success: true, data: { sent: true } });
  });

  it('resetPassword posts to /auth/reset-password and returns the response data', async () => {
    mockedPost.mockResolvedValue({ data: { success: true, data: { updated: true } } });
    const values = { password: 'newpassword1', confirmPassword: 'newpassword1' };

    const result = await resetPassword(values);

    expect(mockedPost).toHaveBeenCalledWith('/auth/reset-password', values);
    expect(result).toEqual({ success: true, data: { updated: true } });
  });

  it('resendVerification posts the email to /auth/resend-verification', async () => {
    mockedPost.mockResolvedValue({ data: { success: true, data: { sent: true } } });

    const result = await resendVerification('a@b.com');

    expect(mockedPost).toHaveBeenCalledWith('/auth/resend-verification', { email: 'a@b.com' });
    expect(result).toEqual({ success: true, data: { sent: true } });
  });
});

describe('getAuthError', () => {
  it('extracts the error message from an Axios error response', () => {
    const err = {
      response: { data: { success: false, error: 'Invalid email or password.' } },
    } as AxiosError<{ success: false; error: string }>;

    expect(getAuthError(err)).toBe('Invalid email or password.');
  });

  it('falls back to a generic message when there is no response', () => {
    const err = {} as AxiosError;

    expect(getAuthError(err)).toBe('Something went wrong. Please try again.');
  });

  it('falls back to a generic message when the response has no error field', () => {
    const err = { response: { data: {} } } as AxiosError;

    expect(getAuthError(err)).toBe('Something went wrong. Please try again.');
  });

  it('falls back to a generic message for a non-Axios error', () => {
    expect(getAuthError(new Error('network down'))).toBe('Something went wrong. Please try again.');
  });
});

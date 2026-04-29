/**
 * authService.ts
 * -----------------
 * This file contains functions for handling user authentication-related API calls, such as logging in, signing up, and password management. It uses the `apiClient` Axios instance to communicate with the backend API and provides a helper function to extract user-friendly error messages from API responses.
 * 
 * @module src/services/authService
 * @author James Latten
 * @created 2026-04-29
 * @version 1.0.0
 */
import apiClient from '@/libs/apiClient';
import type { AxiosError } from 'axios';
import type {
  LoginFormValues,
  SignupFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from '@/libs/validations/auth';
import type { ApiErrorResponse } from '@/libs/apiHelpers';

/** Extract a user-facing error message from an Axios error */
export function getAuthError(err: unknown): string {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return (
    axiosErr?.response?.data?.error ??
    'Something went wrong. Please try again.'
  );
}

export async function loginUser(values: LoginFormValues) {
  const { data } = await apiClient.post('/auth/login', values);
  return data;
}

export async function signupUser(values: SignupFormValues) {
  const { data } = await apiClient.post('/auth/signup', values);
  return data;
}

export async function forgotPassword(values: ForgotPasswordFormValues) {
  const { data } = await apiClient.post('/auth/forgot-password', values);
  return data;
}

export async function resetPassword(values: ResetPasswordFormValues) {
  const { data } = await apiClient.post('/auth/reset-password', values);
  return data;
}

export async function resendVerification(email: string) {
  const { data } = await apiClient.post('/auth/resend-verification', { email });
  return data;
}

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

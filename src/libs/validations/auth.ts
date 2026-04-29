/**
 * auth.ts - Validation schemas for authentication forms using Zod.
 * ------------------
 * This file defines validation schemas for various authentication-related forms, including login, signup, forgot password, and reset password forms. It uses the Zod library to create these schemas, which provide a structured way to validate user input and ensure that it meets the required criteria before being processed.
 * 
 * @module src/libs/validations/auth
 * @author James Latten
 * @created 2026-04-29
 * @version 1.0.0
 */

import { z } from 'zod';

/**
 * Password validation schema:
 * - Minimum length of 8 characters to ensure basic security.
 * - Maximum length of 72 characters to comply with bcrypt limitations and prevent excessively long passwords.
 * 
 * This schema is reused in both the signup and reset password forms to maintain consistent password requirements across the application.
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be less than 72 characters');

/**
 * Login form schema:
 * - Validates that the email field is a non-empty string and follows a valid email format.
 * - Validates that the password field is a non-empty string.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Signup form schema:
 * - Validates that the full name is between 2 and 80 characters.
 * - Validates that the email is a non-empty string and follows a valid email format.
 */
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name is too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Forgot password form schema:
 * - Validates that the email field is a non-empty string and follows a valid email format.
 * 
 * This schema is used to validate the input when a user requests a password reset, ensuring that they provide a valid email address associated with their account.
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

/**
 * Reset password form schema:
 * - Validates that the password meets the defined criteria (length requirements).
 * - Validates that the confirm password field is non-empty and matches the password field.
 * 
 * This schema ensures that when a user is resetting their password, they provide a new password that meets security standards and confirm it correctly to prevent typos.
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Type definitions for form values:
 */
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

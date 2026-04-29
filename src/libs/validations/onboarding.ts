import { z } from 'zod';

export const onboardingProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required.')
    .max(100, 'Full name must be 100 characters or fewer.'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be 30 characters or fewer.')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens.',
    ),
  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or fewer.')
    .optional(),
});

export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;

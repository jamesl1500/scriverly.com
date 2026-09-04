import { describe, expect, it } from 'vitest';
import { onboardingProfileSchema } from './onboarding';

describe('onboardingProfileSchema', () => {
  it('parses a valid profile payload', () => {
    const result = onboardingProfileSchema.safeParse({
      fullName: 'Jane Doe',
      username: 'jane_doe-1',
      bio: 'A short bio.',
    });
    expect(result.success).toBe(true);
  });

  it('parses a valid payload without the optional bio', () => {
    const result = onboardingProfileSchema.safeParse({
      fullName: 'Jane Doe',
      username: 'jane_doe',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing fullName', () => {
    const result = onboardingProfileSchema.safeParse({
      username: 'jane_doe',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a fullName longer than 100 characters', () => {
    const result = onboardingProfileSchema.safeParse({
      fullName: 'A'.repeat(101),
      username: 'jane_doe',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a username shorter than 3 characters', () => {
    const result = onboardingProfileSchema.safeParse({
      fullName: 'Jane Doe',
      username: 'jd',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a username with invalid characters', () => {
    const result = onboardingProfileSchema.safeParse({
      fullName: 'Jane Doe',
      username: 'jane doe!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a bio longer than 500 characters', () => {
    const result = onboardingProfileSchema.safeParse({
      fullName: 'Jane Doe',
      username: 'jane_doe',
      bio: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

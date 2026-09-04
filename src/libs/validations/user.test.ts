import { describe, expect, it } from 'vitest';
import {
  changeEmailSchema,
  changePasswordSchema,
  profileSchema,
  settingsSchema,
} from './user';

describe('profileSchema', () => {
  it('parses a valid full payload', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Doe',
      username: 'jane_doe',
      bio: 'A short bio.',
      institution: 'State University',
      department: 'English',
      academic_level: 'undergraduate',
    });
    expect(result.success).toBe(true);
  });

  it('parses a payload with only the required field', () => {
    const result = profileSchema.safeParse({ full_name: 'Jane Doe' });
    expect(result.success).toBe(true);
  });

  it('rejects a missing full_name', () => {
    const result = profileSchema.safeParse({ username: 'jane_doe' });
    expect(result.success).toBe(false);
  });

  it('rejects a full_name longer than 100 characters', () => {
    const result = profileSchema.safeParse({ full_name: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects a username with invalid characters', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Doe',
      username: 'jane doe!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid academic_level enum value', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Doe',
      academic_level: 'middle_school',
    });
    expect(result.success).toBe(false);
  });
});

describe('settingsSchema', () => {
  it('parses a valid payload', () => {
    const result = settingsSchema.safeParse({
      default_citation_style: 'APA',
      default_essay_type: 'argumentative',
    });
    expect(result.success).toBe(true);
  });

  it('parses an empty payload since all fields are optional', () => {
    const result = settingsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects an invalid citation style enum value', () => {
    const result = settingsSchema.safeParse({ default_citation_style: 'Harvard' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid essay type enum value', () => {
    const result = settingsSchema.safeParse({ default_essay_type: 'poetic' });
    expect(result.success).toBe(false);
  });
});

describe('changeEmailSchema', () => {
  it('parses a valid email', () => {
    const result = changeEmailSchema.safeParse({ newEmail: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects a missing email', () => {
    const result = changeEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email format', () => {
    const result = changeEmailSchema.safeParse({ newEmail: 'nope' });
    expect(result.success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  const base = {
    currentPassword: 'oldpassword',
    newPassword: 'newpassword123',
    confirmPassword: 'newpassword123',
  };

  it('parses a valid password change payload', () => {
    const result = changePasswordSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('rejects a missing currentPassword', () => {
    const result = changePasswordSchema.safeParse({
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a newPassword shorter than 8 characters', () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      newPassword: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched newPassword and confirmPassword', () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      confirmPassword: 'somethingelse',
    });
    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  createEssaySchema,
  essayStep1Schema,
  essayStep2Schema,
  essayStep3Schema,
  updateEssaySchema,
} from './essay';

describe('essayStep1Schema', () => {
  it('parses a valid step 1 payload', () => {
    const result = essayStep1Schema.safeParse({
      title: 'My Essay',
      subject: 'The history of jazz',
      summary: 'A brief overview.',
    });
    expect(result.success).toBe(true);
  });

  it('parses without the optional summary', () => {
    const result = essayStep1Schema.safeParse({
      title: 'My Essay',
      subject: 'The history of jazz',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing title', () => {
    const result = essayStep1Schema.safeParse({
      subject: 'The history of jazz',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a title longer than 200 characters', () => {
    const result = essayStep1Schema.safeParse({
      title: 'A'.repeat(201),
      subject: 'The history of jazz',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a subject longer than 300 characters', () => {
    const result = essayStep1Schema.safeParse({
      title: 'My Essay',
      subject: 'A'.repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it('rejects a summary longer than 1000 characters', () => {
    const result = essayStep1Schema.safeParse({
      title: 'My Essay',
      subject: 'The history of jazz',
      summary: 'A'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('essayStep2Schema', () => {
  it('parses a valid step 2 payload', () => {
    const result = essayStep2Schema.safeParse({
      essay_type: 'argumentative',
      academic_level: 'undergraduate',
      citation_style: 'APA',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid essay_type enum value', () => {
    const result = essayStep2Schema.safeParse({
      essay_type: 'poetic',
      academic_level: 'undergraduate',
      citation_style: 'APA',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid academic_level enum value', () => {
    const result = essayStep2Schema.safeParse({
      essay_type: 'argumentative',
      academic_level: 'middle_school',
      citation_style: 'APA',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid citation_style enum value', () => {
    const result = essayStep2Schema.safeParse({
      essay_type: 'argumentative',
      academic_level: 'undergraduate',
      citation_style: 'Harvard',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing field', () => {
    const result = essayStep2Schema.safeParse({
      essay_type: 'argumentative',
      academic_level: 'undergraduate',
    });
    expect(result.success).toBe(false);
  });
});

describe('essayStep3Schema', () => {
  it('parses a valid step 3 payload', () => {
    const result = essayStep3Schema.safeParse({
      word_goal: 1500,
      due_date: '2026-12-31',
      start_with_outline: true,
    });
    expect(result.success).toBe(true);
  });

  it('parses without the optional word_goal and due_date', () => {
    const result = essayStep3Schema.safeParse({
      start_with_outline: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing start_with_outline (required boolean)', () => {
    const result = essayStep3Schema.safeParse({
      word_goal: 1000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a negative word_goal', () => {
    const result = essayStep3Schema.safeParse({
      word_goal: -100,
      start_with_outline: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer word_goal', () => {
    const result = essayStep3Schema.safeParse({
      word_goal: 100.5,
      start_with_outline: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-boolean start_with_outline', () => {
    const result = essayStep3Schema.safeParse({
      start_with_outline: 'yes',
    });
    expect(result.success).toBe(false);
  });
});

describe('createEssaySchema', () => {
  const base = {
    title: 'My Essay',
    subject: 'The history of jazz',
    essay_type: 'argumentative',
    academic_level: 'undergraduate',
    citation_style: 'APA',
    start_with_outline: true,
  };

  it('parses a valid merged payload', () => {
    const result = createEssaySchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('rejects when a step 1 field is missing', () => {
    const { title: _title, ...rest } = base;
    const result = createEssaySchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects when a step 2 field is an invalid enum', () => {
    const result = createEssaySchema.safeParse({
      ...base,
      citation_style: 'Harvard',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when a step 3 required field is missing', () => {
    const { start_with_outline: _start_with_outline, ...rest } = base;
    const result = createEssaySchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe('updateEssaySchema', () => {
  it('parses a valid partial payload', () => {
    const result = updateEssaySchema.safeParse({
      title: 'Updated title',
      word_count: 500,
    });
    expect(result.success).toBe(true);
  });

  it('parses an empty payload since all fields are optional', () => {
    const result = updateEssaySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects a title over 200 characters', () => {
    const result = updateEssaySchema.safeParse({ title: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects a negative word_count', () => {
    const result = updateEssaySchema.safeParse({ word_count: -5 });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid status enum value', () => {
    const result = updateEssaySchema.safeParse({ status: 'archived' });
    expect(result.success).toBe(false);
  });

  it('accepts a null word_goal', () => {
    const result = updateEssaySchema.safeParse({ word_goal: null });
    expect(result.success).toBe(true);
  });
});

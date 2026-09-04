import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Fast, low-cost model used for all essay AI features (analysis, outline). */
export const essayModel = anthropic('claude-haiku-4-5-20251001');

import { createAnthropic, type AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Model used for all essay AI features (analysis, outline). */
export const essayModel = anthropic('claude-sonnet-5-5');

/**
 * Shared provider options for the essay features. Both are single-shot
 * structured generations, so upfront thinking is skipped and effort is kept
 * low — thinking tokens are billed as output and delay the first streamed
 * token. Raise `effort` here if feedback quality needs it.
 */
export const essayProviderOptions = {
  anthropic: {
    thinking: { type: 'between_tools' },
    effort:   'low',
  } satisfies AnthropicLanguageModelOptions,
};

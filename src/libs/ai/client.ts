import { createAnthropic, type AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Model used for all essay AI features (analysis, outline). */
export const essayModel = anthropic("claude-haiku-5-5");

/**
 * Shared provider options for the essay features. Both are single-shot
 * structured generations, so effort is kept low — Haiku 5.5 thinks adaptively
 * (it can't use `between_tools`, and lowering effort is the supported way to
 * cut thinking), and at `low` it skips thinking on simpler essays. Thinking
 * tokens are billed as output, count toward `maxOutputTokens`, and delay the
 * first streamed token. Raise `effort` here if feedback quality needs it.
 */
export const essayProviderOptions = {
  anthropic: {
    effort: 'low',
  } satisfies AnthropicLanguageModelOptions,
};

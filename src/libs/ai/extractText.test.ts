import { describe, expect, it } from 'vitest';
import { extractText } from './extractText';

describe('extractText', () => {
  it('returns an empty string for null/non-object input', () => {
    expect(extractText(null)).toBe('');
    expect(extractText(undefined)).toBe('');
    expect(extractText('a string')).toBe('');
  });

  it('extracts a single text node', () => {
    expect(extractText({ type: 'text', text: 'Hello' })).toBe('Hello');
  });

  it('extracts text from a paragraph and appends a trailing newline', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    };
    expect(extractText(doc)).toBe('Hello world\n');
  });

  it('concatenates multiple block types in document order', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', content: [{ type: 'text', text: 'Title' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Body text.' }] },
        { type: 'blockquote', content: [{ type: 'text', text: 'A quote.' }] },
      ],
    };
    expect(extractText(doc)).toBe('Title\nBody text.\nA quote.\n');
  });

  it('handles nested block types, like a list item containing a paragraph', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Item one' }] },
          ],
        },
      ],
    };
    expect(extractText(doc)).toBe('Item one\n\n');
  });

  it('concatenates multiple text runs within one paragraph without adding separators', () => {
    const doc = {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Bold ' },
        { type: 'text', text: 'and plain.' },
      ],
    };
    expect(extractText(doc)).toBe('Bold and plain.\n');
  });

  it('returns an empty string for a doc with no content', () => {
    expect(extractText({ type: 'doc', content: [] })).toBe('');
  });

  it('ignores unknown/non-block node types without adding a trailing newline', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'unknownWrapper',
          content: [{ type: 'text', text: 'inner text' }],
        },
      ],
    };
    expect(extractText(doc)).toBe('inner text');
  });
});

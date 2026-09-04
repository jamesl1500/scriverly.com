/** Extracts plain text from a TipTap/ProseMirror JSON document. */
export function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (n.type === 'text') return String(n.text ?? '');
  if (!Array.isArray(n.content)) return '';
  const blockTypes = new Set([
    'paragraph', 'heading', 'blockquote', 'codeBlock', 'listItem',
  ]);
  const childText = (n.content as unknown[]).map(extractText).join('');
  return typeof n.type === 'string' && blockTypes.has(n.type)
    ? childText + '\n'
    : childText;
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Essay } from '@/libs/validations/essay';
import apiClient from '@/libs/apiClient';
import EssayAISidebar from './EssayAISidebar';

vi.mock('@/libs/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const essay: Essay = {
  id:                 'essay-1',
  user_id:            'user-1',
  title:              'My Essay',
  subject:            'History',
  summary:            null,
  content:            {},
  essay_type:         'argumentative',
  academic_level:     'undergraduate',
  citation_style:     'APA',
  word_goal:          null,
  due_date:           null,
  start_with_outline: false,
  outline:            null,
  status:             'draft',
  word_count:         500,
  created_at:         new Date().toISOString(),
  updated_at:         new Date().toISOString(),
};

const ANALYSIS_FIELDS = {
  score: 82,
  score_breakdown: {
    clarity: 80, structure: 85, style_alignment: 78, grammar: 90, vocabulary: 77,
  },
  overall_feedback: 'Solid draft with a few clarity issues to address.',
  style_recommendations: [
    {
      type: 'clarity', severity: 'high' as const,
      message: 'Hard to follow.', suggestion: 'Split it up.',
      original: 'The quick brown fox jumps.',
      example: 'The fox jumps quickly.',
    },
  ],
  spelling_grammar: [
    { original: 'recieve', suggestion: 'receive', reason: 'Common misspelling.' },
  ],
};

function renderSidebar(props: Partial<React.ComponentProps<typeof EssayAISidebar>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <EssayAISidebar essay={essay} editor={null} onClose={vi.fn()} {...props} />
    </QueryClientProvider>,
  );
}

/** Builds a real Response streaming the given object's JSON in a few chunks. */
function streamingResponse(fields: object): Response {
  const json = JSON.stringify(fields);
  const chunks = [json.slice(0, json.length / 2), json.slice(json.length / 2)];
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('EssayAISidebar', () => {
  it('shows the empty state and an Analyze button when there is no cached analysis', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { analysis: null } } });
    renderSidebar();

    expect(await screen.findByText('Analyze your essay')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze Essay' })).toBeInTheDocument();
  });

  it('renders a cached analysis directly from the GET query', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { analysis: { id: 'a1', content_hash: 'h', updated_at: new Date().toISOString(), ...ANALYSIS_FIELDS } } },
    });
    renderSidebar();

    expect(await screen.findByText('Style Recommendations')).toBeInTheDocument();
    expect(screen.getByText('recieve')).toBeInTheDocument();
    expect(screen.getByText(ANALYSIS_FIELDS.overall_feedback)).toBeInTheDocument();
  });

  it('streams a new analysis and renders the final result once the stream completes', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { analysis: null } } });
    const fetchMock = vi.fn().mockResolvedValue(streamingResponse(ANALYSIS_FIELDS));
    vi.stubGlobal('fetch', fetchMock);

    renderSidebar();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Analyze Essay' }));

    expect(await screen.findByText('Style Recommendations', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByLabelText('Essay score: 82 out of 100')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/essays/essay-1/analyze',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('shows the upgrade modal when the analysis quota is exceeded', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { analysis: null } } });
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(
      { success: false, error: 'Quota exceeded', code: 'quota_exceeded', used: 5, limit: 5 },
      402,
    ));
    vi.stubGlobal('fetch', fetchMock);

    renderSidebar();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Analyze Essay' }));

    expect(await screen.findByText('Monthly limit reached')).toBeInTheDocument();
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
  });

  it('applies a style rewrite into the editor using verbatim text matching', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { analysis: { id: 'a1', content_hash: 'h', updated_at: new Date().toISOString(), ...ANALYSIS_FIELDS } } },
    });

    const editor = new Editor({
      extensions: [StarterKit],
      content: `<p>${ANALYSIS_FIELDS.style_recommendations[0].original}</p>`,
    });

    renderSidebar({ editor });
    const user = userEvent.setup();

    const applyBtn = await screen.findByRole('button', { name: 'Apply this rewrite in the editor' });
    await user.click(applyBtn);

    await waitFor(() => {
      expect(editor.getText()).toContain(ANALYSIS_FIELDS.style_recommendations[0].example);
    });
    expect(screen.getByRole('button', { name: 'Change applied' })).toBeInTheDocument();

    editor.destroy();
  });

  it('applies a spelling fix into the editor', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { analysis: { id: 'a1', content_hash: 'h', updated_at: new Date().toISOString(), ...ANALYSIS_FIELDS } } },
    });

    const editor = new Editor({
      extensions: [StarterKit],
      content: `<p>I will ${ANALYSIS_FIELDS.spelling_grammar[0].original} it.</p>`,
    });

    renderSidebar({ editor });
    const user = userEvent.setup();

    const applyBtn = await screen.findByRole('button', { name: 'Apply this fix in the editor' });
    await user.click(applyBtn);

    await waitFor(() => {
      expect(editor.getText()).toContain(ANALYSIS_FIELDS.spelling_grammar[0].suggestion);
    });

    editor.destroy();
  });

  it('forces a re-run when Re-analyze is clicked', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: { analysis: { id: 'a1', content_hash: 'h', updated_at: new Date().toISOString(), ...ANALYSIS_FIELDS } } },
    });
    const fetchMock = vi.fn().mockResolvedValue(streamingResponse(ANALYSIS_FIELDS));
    vi.stubGlobal('fetch', fetchMock);

    renderSidebar();
    const user = userEvent.setup();

    await screen.findByText('Style Recommendations');
    const sidebar = screen.getByRole('complementary', { name: 'Analysis' });
    await user.click(within(sidebar).getByRole('button', { name: 'Re-analyze' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/essays/essay-1/analyze',
        expect.objectContaining({ body: JSON.stringify({ force: true }) }),
      );
    });
  });
});

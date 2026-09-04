import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Essay } from '@/libs/validations/essay';
import apiClient from '@/libs/apiClient';
import EssayOutlinePanel from './EssayOutlinePanel';

vi.mock('@/libs/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

afterEach(() => {
  cleanup();
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

const OUTLINE_ITEMS = [
  { id: 'i1', essay_id: 'essay-1', section: 'introduction', position: 0, heading: 'Hook', talking_point: 'Open with a question.', is_complete: false, created_at: new Date().toISOString() },
  { id: 'i2', essay_id: 'essay-1', section: 'body', position: 0, heading: 'Main argument', talking_point: 'State the thesis.', is_complete: false, created_at: new Date().toISOString() },
  { id: 'i3', essay_id: 'essay-1', section: 'conclusion', position: 0, heading: 'Wrap up', talking_point: 'Restate the thesis.', is_complete: false, created_at: new Date().toISOString() },
];

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <EssayOutlinePanel essay={essay} onClose={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe('EssayOutlinePanel', () => {
  it('shows the empty state and a Generate Outline button when there are no items', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { items: [] } } });
    renderPanel();

    expect(await screen.findByText('No outline yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Outline' })).toBeInTheDocument();
  });

  it('renders existing outline items grouped by section', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { items: OUTLINE_ITEMS } } });
    renderPanel();

    expect(await screen.findByText('Hook')).toBeInTheDocument();
    expect(screen.getByText('Main argument')).toBeInTheDocument();
    expect(screen.getByText('Wrap up')).toBeInTheDocument();
    expect(screen.getByText('Open with a question.')).toBeInTheDocument();
  });

  it('generates an outline and renders the returned items', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { items: [] } } });
    vi.mocked(apiClient.post).mockResolvedValue({ data: { data: { items: OUTLINE_ITEMS } } });

    renderPanel();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Generate Outline' }));

    expect(await screen.findByText('Hook')).toBeInTheDocument();
    expect(apiClient.post).toHaveBeenCalledWith('/essays/essay-1/outline');
  });

  it('toggles item completion via the check button', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { items: OUTLINE_ITEMS } } });
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { data: {} } });

    renderPanel();
    const user = userEvent.setup();

    await screen.findByText('Hook');
    await user.click(screen.getAllByRole('button', { name: 'Mark complete' })[0]);

    expect(apiClient.patch).toHaveBeenCalledWith('/essays/essay-1/outline', { itemId: 'i1', is_complete: true });
  });

  it('shows the upgrade modal when the outline quota is exceeded', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { items: [] } } });
    vi.mocked(apiClient.post).mockRejectedValue({
      response: { status: 402, data: { error: 'Quota exceeded', code: 'quota_exceeded', used: 3, limit: 3 } },
    });

    renderPanel();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Generate Outline' }));

    expect(await screen.findByText('Monthly limit reached')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });
});

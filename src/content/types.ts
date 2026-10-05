/** One block of body copy on a feature or guide page. */
export interface ContentSection {
  heading:     string;
  paragraphs?: string[];
  /** Rendered as a bulleted list, or numbered when `ordered` is set. */
  list?:       string[];
  ordered?:    boolean;
  /** Paragraphs shown after the list. */
  after?:      string[];
}

export interface ContentPage {
  slug:        string;
  /** Used for <title>, og:title and the page <h1>. */
  title:       string;
  /** Short label for cards, nav and breadcrumbs. */
  label:       string;
  description: string;
  intro:       string;
  sections:    ContentSection[];
}

describe('Essays page', () => {
  before(function () {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    if (!email || !password) this.skip();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/essays');
  });

  // ── Page structure ─────────────────────────────────────────────────────────

  it('renders the "My Essays" heading', () => {
    cy.get('h1').should('contain.text', 'My Essays');
  });

  it('renders the page subheading', () => {
    cy.contains('All your writing in one place').should('be.visible');
  });

  it('renders a "New essay" link in the page header', () => {
    cy.contains('a', 'New essay')
      .should('be.visible')
      .and('have.attr', 'href', '/essays/new');
  });

  // ── Essay list or empty state ──────────────────────────────────────────────

  it('renders either essay cards or an empty state message', () => {
    cy.get('body').then(($body) => {
      const text = $body.text();
      const hasContent =
        // Has essays
        $body.find('[class*="essayCard"], [class*="card"], article').length > 0 ||
        // Has empty state text
        text.includes('No essays') ||
        text.includes("haven't") ||
        text.includes('Start writing') ||
        text.includes('Create your first');
      expect(hasContent).to.be.true;
    });
  });

  // ── Essay cards (only when essays exist) ──────────────────────────────────

  it('essay cards link to the individual essay page', () => {
    cy.get('body').then(($body) => {
      const cards = $body.find('a[href*="/essays/"]').not('[href="/essays/new"]');
      if (cards.length > 0) {
        cy.wrap(cards.first())
          .invoke('attr', 'href')
          .should('match', /\/essays\/[a-zA-Z0-9-]+/);
      }
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('navigates to the new essay form from the "New essay" link', () => {
    cy.contains('a', 'New essay').first().click();
    cy.url().should('include', '/essays/new');
  });

  it('navigates back to dashboard via the nav link', () => {
    cy.contains('a', 'Dashboard').click();
    cy.url().should('include', '/dashboard');
  });
});

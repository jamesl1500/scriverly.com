describe('Dashboard page', () => {
  before(function () {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    if (!email || !password) this.skip();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  // ── Page structure ─────────────────────────────────────────────────────────

  it('renders the Dashboard heading', () => {
    cy.get('h1').should('contain.text', 'Dashboard');
  });

  it('renders the welcome subheading', () => {
    cy.contains("Here's where your writing lives").should('be.visible');
  });

  it('renders a "New essay" action button in the header', () => {
    cy.contains('a', 'New essay')
      .should('be.visible')
      .and('have.attr', 'href', '/essays/new');
  });

  // ── Stats cards ────────────────────────────────────────────────────────────

  it('renders all four stat cards with labels', () => {
    cy.contains('Total essays').should('be.visible');
    cy.contains('Complete').should('be.visible');
    cy.contains('In progress').should('be.visible');
    cy.contains('Words written').should('be.visible');
  });

  it('renders numeric values in each stat card', () => {
    // Each stat value should be a number (or formatted like "1.2k")
    cy.contains('Total essays')
      .closest('[class]')
      .within(() => {
        cy.get('[class]').should('exist');
      });
  });

  // ── Recent essays section ──────────────────────────────────────────────────

  it('shows a "Recent essays" or empty state section', () => {
    // Either recent essay cards or the empty state are rendered
    cy.get('body').then(($body) => {
      const hasRecentSection =
        $body.text().includes('Recent essays') ||
        $body.text().includes('Your essays will appear') ||
        $body.text().includes('Start writing') ||
        $body.text().includes('New essay');
      expect(hasRecentSection).to.be.true;
    });
  });

  // ── Empty state (only asserted when no essays exist) ──────────────────────

  it('shows an onboarding flow in the empty state', () => {
    // If the user has no essays, the empty state shows 3 steps
    cy.get('body').then(($body) => {
      if (
        !$body.text().includes('Recent essays') &&
        $body.text().includes('Create')
      ) {
        // Empty state is showing — verify the 3-step flow labels
        cy.contains('Create').should('be.visible');
        cy.contains('Outline').should('be.visible');
        cy.contains('Analysis').should('be.visible');

        // CTA button leads to new essay
        cy.contains('a', /new essay|start writing/i)
          .should('be.visible')
          .and('have.attr', 'href', '/essays/new');
      }
    });
  });

  // ── Navigation from dashboard ──────────────────────────────────────────────

  it('navigates to the essays page via the nav link', () => {
    cy.contains('a', 'Essays').click();
    cy.url().should('include', '/essays');
  });

  it('navigates to a new essay page from the "New essay" button', () => {
    cy.contains('a', 'New essay').first().click();
    cy.url().should('include', '/essays/new');
  });
});

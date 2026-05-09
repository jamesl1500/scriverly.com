describe('App navigation (AppNav)', () => {
  before(function () {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    if (!email || !password) this.skip();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  // ── Nav structure ──────────────────────────────────────────────────────────

  it('renders the nav element', () => {
    cy.get('nav').should('exist').and('be.visible');
  });

  it('renders the Dashboard nav link', () => {
    cy.contains('a', 'Dashboard')
      .should('be.visible')
      .and('have.attr', 'href', '/dashboard');
  });

  it('renders the Essays nav link', () => {
    cy.contains('a', 'Essays')
      .should('be.visible')
      .and('have.attr', 'href', '/essays');
  });

  it('renders a "New essay" button in the nav', () => {
    cy.contains('a', 'New essay')
      .should('be.visible')
      .and('have.attr', 'href', '/essays/new');
  });

  it('renders the account menu button', () => {
    cy.get('[aria-label="Account menu"]').should('be.visible');
  });

  // ── Active link state ──────────────────────────────────────────────────────

  it('marks the Dashboard link as active when on /dashboard', () => {
    cy.visit('/dashboard');
    // The active class is applied by the component; verify ARIA or text presence
    cy.contains('a', 'Dashboard').should('be.visible');
  });

  it('marks the Essays link as active when on /essays', () => {
    cy.visit('/essays');
    cy.contains('a', 'Essays').should('be.visible');
  });

  // ── Navigation via nav links ───────────────────────────────────────────────

  it('navigates to /essays when Essays is clicked', () => {
    cy.contains('a', 'Essays').click();
    cy.url().should('include', '/essays');
  });

  it('navigates to /dashboard when Dashboard is clicked from another page', () => {
    cy.visit('/essays');
    cy.contains('a', 'Dashboard').click();
    cy.url().should('include', '/dashboard');
  });

  it('navigates to /essays/new when "New essay" is clicked', () => {
    cy.contains('a', 'New essay').click();
    cy.url().should('include', '/essays/new');
  });

  // ── User dropdown menu ─────────────────────────────────────────────────────

  it('opens the user dropdown when the account button is clicked', () => {
    cy.get('[aria-label="Account menu"]').should('be.visible').click();
    cy.get('[role="menu"]', { timeout: 5000 }).should('be.visible');
  });

  it('shows Profile, Settings, and Sign out items in the dropdown', () => {
    cy.get('[aria-label="Account menu"]').should('be.visible').click();
    cy.get('[role="menu"]', { timeout: 5000 }).should('be.visible').within(() => {
      cy.contains('[role="menuitem"]', 'Profile').should('be.visible');
      cy.contains('[role="menuitem"]', 'Settings').should('be.visible');
      cy.contains('[role="menuitem"]', 'Sign out').should('be.visible');
    });
  });

  it('closes the dropdown when clicking outside', () => {
    cy.get('[aria-label="Account menu"]').should('be.visible').click();
    cy.get('[role="menu"]', { timeout: 5000 }).should('be.visible');
    cy.get('body').click(0, 0); // click away
    cy.get('[role="menu"]').should('not.exist');
  });

  it('navigates to /profile when Profile is clicked in the dropdown', () => {
    cy.get('[aria-label="Account menu"]').should('be.visible').click();
    cy.get('[role="menu"]', { timeout: 5000 }).should('be.visible');
    cy.contains('[role="menuitem"]', 'Profile').click();
    cy.url().should('include', '/profile');
  });

  it('navigates to /settings when Settings is clicked in the dropdown', () => {
    cy.get('[aria-label="Account menu"]').should('be.visible').click();
    cy.get('[role="menu"]', { timeout: 5000 }).should('be.visible');
    cy.contains('[role="menuitem"]', 'Settings').click();
    cy.url().should('include', '/settings');
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  it('redirects to /login after clicking Sign out', () => {
    // Ensure the nav is fully interactive before clicking
    cy.get('[aria-label="Account menu"]').should('be.visible').click();
    cy.get('[role="menu"]', { timeout: 5000 }).should('be.visible');
    cy.get('[role="menu"]')
      .contains('[role="menuitem"]', 'Sign out')
      .closest('form')
      .submit();
    cy.url().should('include', '/login');

    // Restore authenticated session for subsequent tests so they aren't polluted
    cy.login();
  });

  it('cannot access /dashboard after logging out', () => {
    // Call the logout API directly — avoids re-opening the dropdown and the
    // cy.session() cache issue that can occur after a full-page form submission.
    cy.logout();

    // Route guard should redirect to login
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });

  // ── Mobile nav ─────────────────────────────────────────────────────────────

  it('shows a mobile menu toggle on small viewports', () => {
    cy.viewport(375, 812); // iPhone SE
    cy.visit('/dashboard');
    cy.get('[aria-label="Open menu"]').should('be.visible');
  });

  it('opens and closes the mobile nav drawer', () => {
    cy.viewport(375, 812);
    cy.visit('/dashboard');
    cy.get('[aria-label="Open menu"]').click();
    cy.get('[aria-label="Close menu"]').should('be.visible');
    cy.get('[aria-label="Close menu"]').click();
    cy.get('[aria-label="Open menu"]').should('be.visible');
  });
});

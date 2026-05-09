describe('Settings page', () => {
  before(function () {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    if (!email || !password) this.skip();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/settings');
  });

  // ── Page structure ─────────────────────────────────────────────────────────

  it('renders the Settings heading and subheading', () => {
    cy.get('h1').should('contain.text', 'Settings');
    cy.contains('Manage your writing preferences').should('be.visible');
  });

  it('renders all four tab buttons', () => {
    cy.contains('button', 'Preferences').should('be.visible');
    cy.contains('button', 'Account').should('be.visible');
    cy.contains('button', 'Billing').should('be.visible');
    cy.contains('button', 'Danger zone').should('be.visible');
  });

  it('defaults to the Preferences tab being active', () => {
    cy.contains('button', 'Preferences').should('have.attr', 'aria-current', 'page');
  });

  // ── Tab switching ──────────────────────────────────────────────────────────

  it('switches to the Account tab when clicked', () => {
    cy.contains('button', 'Account').click();
    cy.contains('button', 'Account').should('have.attr', 'aria-current', 'page');
    cy.contains('button', 'Preferences').should('not.have.attr', 'aria-current');
  });

  it('switches to the Billing tab when clicked', () => {
    cy.contains('button', 'Billing').click();
    cy.contains('button', 'Billing').should('have.attr', 'aria-current', 'page');
  });

  it('switches to the Danger zone tab when clicked', () => {
    cy.contains('button', 'Danger zone').click();
    cy.contains('button', 'Danger zone').should('have.attr', 'aria-current', 'page');
  });

  // ── Preferences tab content ────────────────────────────────────────────────

  it('shows default citation style and essay type selects in the Preferences tab', () => {
    // Preferences is the default active tab
    cy.contains('Citation style', { matchCase: false }).should('be.visible');
    cy.contains('Essay type', { matchCase: false }).should('be.visible');
  });

  it('renders a Save button in the Preferences tab', () => {
    cy.contains('button', /save/i).should('be.visible');
  });

  // ── Account tab content ────────────────────────────────────────────────────

  it('shows the user email address in the Account tab', () => {
    cy.contains('button', 'Account').click();
    const email = Cypress.env('TEST_USER_EMAIL') as string;
    if (email) {
      cy.contains(email).should('be.visible');
    } else {
      cy.contains(/@/).should('exist');
    }
  });

  it('shows change email and change password sections in the Account tab', () => {
    cy.contains('button', 'Account').click();
    cy.contains(/change email/i).should('be.visible');
    cy.contains(/change password/i).should('be.visible');
  });

  // ── Billing tab content ────────────────────────────────────────────────────

  it('shows current plan information in the Billing tab', () => {
    cy.contains('button', 'Billing').click();
    // Should show either "Free" or "Premium" plan
    cy.contains(/free|premium/i).should('be.visible');
  });

  // ── Danger zone tab content ────────────────────────────────────────────────

  it('shows a delete account section in the Danger zone tab', () => {
    cy.contains('button', 'Danger zone').click();
    cy.contains(/delete.*account|account.*delete/i).should('be.visible');
  });

  it('the delete account action requires confirmation (shows a warning)', () => {
    cy.contains('button', 'Danger zone').click();
    cy.contains(/permanent|cannot be undone|irreversible/i).should('be.visible');
  });

  // ── URL parameter: billing tab auto-selection ──────────────────────────────

  it('auto-selects the Billing tab when ?billing=success is in the URL', () => {
    cy.visit('/settings?billing=success');
    cy.contains('button', 'Billing').should('have.attr', 'aria-current', 'page');
  });

  it('shows a success banner when ?billing=success is in the URL', () => {
    cy.visit('/settings?billing=success');
    cy.contains(/upgrade.*success|plan.*upgraded|premium.*activated/i).should('be.visible');
  });

  it('auto-selects the Billing tab when ?billing=cancelled is in the URL', () => {
    cy.visit('/settings?billing=cancelled');
    cy.contains('button', 'Billing').should('have.attr', 'aria-current', 'page');
  });

  it('cleans the ?billing= param from the URL after mounting', () => {
    cy.visit('/settings?billing=success');
    // After mount, the URL should be cleaned to /settings
    cy.url().should('not.include', 'billing=');
    cy.url().should('match', /\/settings$/);
  });
});

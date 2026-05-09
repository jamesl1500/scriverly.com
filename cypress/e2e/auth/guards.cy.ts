/**
 * Auth guard tests
 * Verifies that unauthenticated users are redirected to /login when they
 * attempt to access protected routes, and that authenticated users can
 * reach those routes without being bounced.
 */

const PROTECTED_ROUTES = [
  '/dashboard',
  '/essays',
  '/profile',
  '/settings',
];

describe('Auth guards – unauthenticated access', () => {
  beforeEach(() => {
    // Ensure no session is present before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  PROTECTED_ROUTES.forEach((route) => {
    it(`redirects ${route} to /login when not authenticated`, () => {
      cy.visit(route, { failOnStatusCode: false });
      cy.url().should('include', '/login');
    });
  });

  it('does not redirect /login to another page when unauthenticated', () => {
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.get('h1').should('contain.text', 'Welcome back');
  });

  it('does not redirect /signup to another page when unauthenticated', () => {
    cy.visit('/signup');
    cy.url().should('include', '/signup');
    cy.get('h1').should('contain.text', 'Create your account');
  });

  it('does not redirect /forgot_password when unauthenticated', () => {
    cy.visit('/forgot_password');
    cy.url().should('include', '/forgot_password');
    cy.get('h1').should('contain.text', 'Forgot your password?');
  });

  it('does not redirect /reset_password when unauthenticated', () => {
    cy.visit('/reset_password');
    cy.url().should('include', '/reset_password');
  });
});

describe('Auth guards – authenticated access', () => {
  before(function () {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    if (!email || !password) this.skip();
  });

  beforeEach(() => {
    cy.login();
  });

  PROTECTED_ROUTES.forEach((route) => {
    it(`allows authenticated access to ${route}`, () => {
      cy.visit(route);
      cy.url().should('include', route);
      // Should NOT be sent to login
      cy.url().should('not.include', '/login');
    });
  });
});

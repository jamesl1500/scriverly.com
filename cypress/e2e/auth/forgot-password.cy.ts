describe('Forgot password page', () => {
  beforeEach(() => {
    cy.visit('/forgot_password');
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the page heading and subheading', () => {
    cy.get('h1').should('contain.text', 'Forgot your password?');
    cy.contains("we'll send you a reset link").should('be.visible');
  });

  it('renders the email input', () => {
    cy.get('#email').should('be.visible').and('have.attr', 'type', 'email');
  });

  it('renders the submit button', () => {
    cy.contains('button[type="submit"]', 'Send reset link').should('be.visible');
  });

  it('renders a back to sign in link pointing to /login', () => {
    cy.contains('a', /back to sign in/i)
      .should('be.visible')
      .and('have.attr', 'href', '/login');
  });

  // ── Client-side validation ──────────────────────────────────────────────────

  it('shows a required error on empty email submission', () => {
    cy.contains('button[type="submit"]', 'Send reset link').click();
    cy.contains('[role="alert"]', /email is required/i).should('be.visible');
  });

  it('shows an email format error for an invalid address', () => {
    cy.get('#email').type('notanemail');
    cy.contains('button[type="submit"]', 'Send reset link').click();
    cy.contains('[role="alert"]', /valid email/i).should('be.visible');
  });

  // ── API error handling ─────────────────────────────────────────────────────

  it('displays a server error alert when the API returns an error', () => {
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 500,
      body: { error: 'Something went wrong. Please try again.', code: 'server_error' },
    }).as('forgotPassword');

    cy.get('#email').type('user@example.com');
    cy.contains('button[type="submit"]', 'Send reset link').click();
    cy.wait('@forgotPassword');

    cy.get('[role="alert"]')
      .should('be.visible')
      .and('contain.text', 'Something went wrong');
  });

  // ── Success state ──────────────────────────────────────────────────────────

  it('shows the "Check your inbox" success state after a valid submission', () => {
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 200,
      body: { data: { sent: true } },
    }).as('forgotPassword');

    cy.get('#email').type('user@example.com');
    cy.contains('button[type="submit"]', 'Send reset link').click();
    cy.wait('@forgotPassword');

    cy.get('h1').should('contain.text', 'Check your inbox');
  });

  it('shows the submitted email address in the success state', () => {
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 200,
      body: { data: { sent: true } },
    }).as('forgotPassword');

    cy.get('#email').type('jane@example.com');
    cy.contains('button[type="submit"]', 'Send reset link').click();
    cy.wait('@forgotPassword');

    cy.contains('jane@example.com').should('be.visible');
  });

  it('shows a success status alert in the success state', () => {
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 200,
      body: { data: { sent: true } },
    }).as('forgotPassword');

    cy.get('#email').type('user@example.com');
    cy.contains('button[type="submit"]', 'Send reset link').click();
    cy.wait('@forgotPassword');

    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', 'Reset link sent successfully');
  });

  it('shows a back to sign in link in the success state', () => {
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 200,
      body: { data: { sent: true } },
    }).as('forgotPassword');

    cy.get('#email').type('user@example.com');
    cy.contains('button[type="submit"]', 'Send reset link').click();
    cy.wait('@forgotPassword');

    cy.contains('a', /back to sign in/i)
      .should('be.visible')
      .and('have.attr', 'href', '/login');
  });

  // ── Note: the API intentionally returns 200 even for non-existent emails
  //   to prevent user enumeration. The success state should always display.

  it('shows the success state even for an unregistered email (anti-enumeration)', () => {
    cy.intercept('POST', '/api/auth/forgot-password', {
      statusCode: 200,
      body: { data: { sent: true } },
    }).as('forgotPassword');

    cy.get('#email').type('doesnotexist@example.com');
    cy.contains('button[type="submit"]', 'Send reset link').click();
    cy.wait('@forgotPassword');

    cy.get('h1').should('contain.text', 'Check your inbox');
  });
});

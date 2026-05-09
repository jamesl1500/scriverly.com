describe('Login page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the page title and subheading', () => {
    cy.get('h1').should('contain.text', 'Welcome back');
    cy.contains('Sign in to your Scriverly account').should('be.visible');
  });

  it('renders email and password inputs', () => {
    cy.get('#email').should('be.visible').and('have.attr', 'type', 'email');
    cy.get('#password').should('be.visible').and('have.attr', 'type', 'password');
  });

  it('renders the Sign in submit button', () => {
    cy.contains('button[type="submit"]', 'Sign in').should('be.visible');
  });

  it('renders a "Forgot password?" link pointing to the correct route', () => {
    cy.contains('a', 'Forgot password?')
      .should('be.visible')
      .and('have.attr', 'href', '/forgot_password');
  });

  it('renders a sign-up link pointing to /signup', () => {
    cy.contains('a', 'Create one for free')
      .should('be.visible')
      .and('have.attr', 'href', '/signup');
  });

  // ── Client-side validation ──────────────────────────────────────────────────

  it('shows required validation errors when form is submitted empty', () => {
    cy.contains('button[type="submit"]', 'Sign in').click();
    cy.contains('[role="alert"]', 'Email is required').should('be.visible');
    cy.contains('[role="alert"]', 'Password is required').should('be.visible');
  });

  it('shows an email format error for an invalid email', () => {
    cy.get('#email').type('notanemail');
    cy.contains('button[type="submit"]', 'Sign in').click();
    cy.contains('[role="alert"]', 'Enter a valid email address').should('be.visible');
  });

  it('does not show validation errors when both fields have valid values', () => {
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('somepassword');
    // Intercept so the form does not actually submit
    cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { data: {} } }).as('login');
    cy.contains('button[type="submit"]', 'Sign in').click();
    cy.wait('@login');
    cy.get('[role="alert"]').should('not.exist');
  });

  // ── Password visibility toggle ─────────────────────────────────────────────

  it('toggles the password field between text and password type', () => {
    cy.get('#password').type('mysecretpassword');
    cy.get('#password').should('have.attr', 'type', 'password');

    cy.get('[aria-label="Show password"]').click();
    cy.get('#password').should('have.attr', 'type', 'text');

    cy.get('[aria-label="Hide password"]').click();
    cy.get('#password').should('have.attr', 'type', 'password');
  });

  // ── API error handling ─────────────────────────────────────────────────────

  it('displays a server error alert on invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { error: 'Invalid email or password', code: 'invalid_credentials' },
    }).as('loginRequest');

    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('wrongpassword123');
    cy.contains('button[type="submit"]', 'Sign in').click();
    cy.wait('@loginRequest');

    cy.get('[role="alert"]')
      .should('be.visible')
      .and('contain.text', 'Invalid email or password');
  });

  it('clears the server error when the user starts editing the form', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { error: 'Invalid email or password', code: 'invalid_credentials' },
    }).as('firstRequest');

    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('wrongpassword123');
    cy.contains('button[type="submit"]', 'Sign in').click();
    cy.wait('@firstRequest');
    cy.get('[role="alert"]').should('be.visible');

    // Intercept the second attempt to keep the test self-contained
    cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { data: {} } }).as(
      'secondRequest',
    );
    cy.get('#email').clear().type('another@example.com');
    cy.contains('button[type="submit"]', 'Sign in').click();
    cy.wait('@secondRequest');

    cy.get('[role="alert"]').should('not.exist');
  });

  // ── Full login flow (requires TEST_USER_EMAIL / TEST_USER_PASSWORD) ─────────

  it('redirects to /dashboard on successful login', function () {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');

    if (!email || !password) {
      this.skip();
    }

    cy.get('#email').type(email as string);
    cy.get('#password').type(password as string);
    cy.contains('button[type="submit"]', 'Sign in').click();
    cy.url().should('include', '/dashboard');
  });

  it('navigates to /forgot_password when "Forgot password?" is clicked', () => {
    cy.contains('a', 'Forgot password?').click();
    cy.url().should('include', '/forgot_password');
  });

  it('navigates to /signup when the sign-up link is clicked', () => {
    cy.contains('a', 'Create one for free').click();
    cy.url().should('include', '/signup');
  });
});

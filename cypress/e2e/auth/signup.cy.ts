describe('Signup page', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the page heading and subheading', () => {
    cy.get('h1').should('contain.text', 'Create your account');
    cy.contains('Start writing smarter essays today').should('be.visible');
  });

  it('renders all four form fields', () => {
    cy.get('#fullName').should('be.visible').and('have.attr', 'type', 'text');
    cy.get('#email').should('be.visible').and('have.attr', 'type', 'email');
    cy.get('#password').should('be.visible').and('have.attr', 'type', 'password');
    cy.get('#confirmPassword').should('be.visible').and('have.attr', 'type', 'password');
  });

  it('renders the submit button', () => {
    cy.contains('button[type="submit"]', 'Create account').should('be.visible');
  });

  it('renders a sign-in link pointing to /login', () => {
    cy.contains('a', 'Sign in').should('be.visible').and('have.attr', 'href', '/login');
  });

  // ── Client-side validation ──────────────────────────────────────────────────

  it('shows required field validation errors on empty form submission', () => {
    cy.contains('button[type="submit"]', 'Create account').click();
    // At minimum, name and email should have required errors
    cy.get('[role="alert"]').should('have.length.gte', 2);
  });

  it('shows a name minimum length error', () => {
    cy.get('#fullName').type('A'); // single character — too short
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.contains('[role="alert"]', 'at least 2 characters').should('be.visible');
  });

  it('shows an invalid email format error', () => {
    cy.get('#fullName').type('Alex Johnson');
    cy.get('#email').type('bademail');
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.contains('[role="alert"]', 'valid email').should('be.visible');
  });

  it('shows a password minimum length error', () => {
    cy.get('#fullName').type('Alex Johnson');
    cy.get('#email').type('alex@example.com');
    cy.get('#password').type('short'); // under 8 chars
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.contains('[role="alert"]', 'at least 8 characters').should('be.visible');
  });

  it('shows a password mismatch error when passwords do not match', () => {
    cy.get('#fullName').type('Alex Johnson');
    cy.get('#email').type('alex@example.com');
    cy.get('#password').type('securepassword1');
    cy.get('#confirmPassword').type('doesnotmatch1');
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.contains('[role="alert"]', /passwords? do(es)? not match|must match/i).should('be.visible');
  });

  it('does not show validation errors for a fully valid form before submission', () => {
    cy.intercept('POST', '/api/auth/signup', {
      statusCode: 200,
      body: { data: { requiresEmailConfirmation: true } },
    }).as('signup');

    cy.get('#fullName').type('Alex Johnson');
    cy.get('#email').type('alex@example.com');
    cy.get('#password').type('securepassword1');
    cy.get('#confirmPassword').type('securepassword1');
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.wait('@signup');

    cy.get('[role="alert"]').should('not.exist');
  });

  // ── Password visibility toggles ────────────────────────────────────────────

  it('toggles the password field visibility', () => {
    cy.get('#password').type('mypassword1');
    cy.get('[aria-label="Show password"]').first().click();
    cy.get('#password').should('have.attr', 'type', 'text');
    cy.get('[aria-label="Hide password"]').first().click();
    cy.get('#password').should('have.attr', 'type', 'password');
  });

  it('toggles the confirm password field visibility independently', () => {
    cy.get('#confirmPassword').type('mypassword1');
    // The confirm field has its own Show/Hide button (second one on the page)
    cy.get('[aria-label="Show password"]').last().click();
    cy.get('#confirmPassword').should('have.attr', 'type', 'text');
    cy.get('[aria-label="Hide password"]').last().click();
    cy.get('#confirmPassword').should('have.attr', 'type', 'password');
  });

  // ── API error handling ─────────────────────────────────────────────────────

  it('displays a server error alert when the API returns an error', () => {
    cy.intercept('POST', '/api/auth/signup', {
      statusCode: 422,
      body: { error: 'An account with this email already exists.', code: 'email_exists' },
    }).as('signup');

    cy.get('#fullName').type('Alex Johnson');
    cy.get('#email').type('taken@example.com');
    cy.get('#password').type('securepassword1');
    cy.get('#confirmPassword').type('securepassword1');
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.wait('@signup');

    cy.get('[role="alert"]')
      .should('be.visible')
      .and('contain.text', 'An account with this email already exists.');
  });

  // ── Successful signup flow ─────────────────────────────────────────────────

  it('redirects to /verify-email after successful signup requiring confirmation', () => {
    cy.intercept('POST', '/api/auth/signup', {
      statusCode: 200,
      body: { data: { requiresEmailConfirmation: true } },
    }).as('signup');

    cy.get('#fullName').type('Alex Johnson');
    cy.get('#email').type('newuser@example.com');
    cy.get('#password').type('securepassword1');
    cy.get('#confirmPassword').type('securepassword1');
    cy.contains('button[type="submit"]', 'Create account').click();
    cy.wait('@signup');

    cy.url().should('include', '/verify-email');
    cy.url().should('include', 'newuser%40example.com');
  });

  it('navigates to /login when the sign-in link is clicked', () => {
    cy.contains('a', 'Sign in').click();
    cy.url().should('include', '/login');
  });
});

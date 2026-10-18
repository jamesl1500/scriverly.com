/// <reference types="cypress" />

// `export {}` is required to make this file a module so that
// `declare global` augments the global namespace correctly.
export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Cypress types are augmented via this global namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Yields the test user's credentials from TEST_USER_EMAIL and
       * TEST_USER_PASSWORD (empty strings when unset).
       */
      testUser(): Chainable<{ email: string; password: string }>;

      /**
       * Programmatically logs in by calling the login API route directly.
       * Uses cy.session() to cache and restore auth cookies across tests in
       * the same spec (and across specs via cacheAcrossSpecs).
       *
       * Requires TEST_USER_EMAIL and TEST_USER_PASSWORD to be set in
       * cypress.env.json or as CI environment variables.
       */
      login(email?: string, password?: string): Chainable;

      /**
       * Logs out by calling the logout API route and clearing all cookies.
       */
      logout(): Chainable;
    }
  }
}

Cypress.Commands.add('testUser', () =>
  cy
    .env<{ TEST_USER_EMAIL?: string; TEST_USER_PASSWORD?: string }>(
      ['TEST_USER_EMAIL', 'TEST_USER_PASSWORD'],
      { log: false },
    )
    .then(({ TEST_USER_EMAIL, TEST_USER_PASSWORD }) => ({
      email:    TEST_USER_EMAIL ?? '',
      password: TEST_USER_PASSWORD ?? '',
    })),
);

Cypress.Commands.add('login', (emailArg?: string, passwordArg?: string) => {
  cy.testUser().then((user) => {
    const email = emailArg ?? user.email;
    const password = passwordArg ?? user.password;

    cy.session(
      ['auth-session', email],
      () => {
        cy.request({
          method: 'POST',
          url: '/api/auth/login',
          body: { email, password },
          failOnStatusCode: true,
        });
      },
      {
        // Re-validate that the session cookie is still valid before reuse.
        validate() {
          cy.request({
            url: '/api/user/profile',
            failOnStatusCode: false,
          })
            .its('status')
            .should('eq', 200);
        },
        cacheAcrossSpecs: true,
      },
    );
  });
});

Cypress.Commands.add('logout', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/logout',
    followRedirect: false,
    failOnStatusCode: false,
  });
  cy.clearCookies();
});

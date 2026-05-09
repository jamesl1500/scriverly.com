import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,

    /**
     * Set TEST_USER_EMAIL and TEST_USER_PASSWORD in cypress.env.json
     * (never commit that file) or via CI environment variables.
     * All tests that require an authenticated session use these credentials.
     */
    env: {
      TEST_USER_EMAIL: "",
      TEST_USER_PASSWORD: "",
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});


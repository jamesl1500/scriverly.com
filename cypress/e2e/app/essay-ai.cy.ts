const ANALYSIS_FIXTURE = {
  id: 'analysis-1',
  score: 82,
  score_breakdown: {
    clarity: 80,
    structure: 85,
    style_alignment: 78,
    grammar: 90,
    vocabulary: 77,
  },
  style_recommendations: [
    {
      type: 'clarity',
      severity: 'high',
      message: 'This sentence is hard to follow.',
      suggestion: 'Break it into two shorter sentences.',
      original: 'The essay content is long enough for testing.',
      example: 'The essay content is long. It is long enough for testing.',
    },
  ],
  spelling_grammar: [
    {
      original: 'recieve',
      suggestion: 'receive',
      reason: 'Common misspelling — "i" before "e" except after "c".',
    },
  ],
  overall_feedback: 'Solid draft with a few clarity issues to address.',
  content_hash: 'abc123',
  updated_at: new Date().toISOString(),
};

const OUTLINE_FIXTURE = {
  items: [
    { id: 'i1', essay_id: 'e1', section: 'introduction', position: 0, heading: 'Hook', talking_point: 'Open with a question.', is_complete: false, created_at: new Date().toISOString() },
    { id: 'i2', essay_id: 'e1', section: 'body', position: 0, heading: 'Main argument', talking_point: 'State the thesis.', is_complete: false, created_at: new Date().toISOString() },
    { id: 'i3', essay_id: 'e1', section: 'conclusion', position: 0, heading: 'Wrap up', talking_point: 'Restate the thesis.', is_complete: false, created_at: new Date().toISOString() },
  ],
};

describe('Essay AI features', () => {
  before(function () {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    if (!email || !password) this.skip();
  });

  beforeEach(function () {
    cy.login();
    cy.visit('/essays');

    cy.get('body').then(($body) => {
      const link = $body.find('a[href*="/essays/"]').not('[href="/essays/new"]').first();
      if (link.length === 0) {
        this.skip();
        return;
      }
      cy.wrap(link).invoke('attr', 'href').then((href) => {
        cy.visit(href as unknown as string);
      });
    });
  });

  // ── Analysis sidebar ─────────────────────────────────────────────────────

  describe('Analysis sidebar', () => {
    it('runs an analysis and renders score, breakdown, recommendations, and spelling issues', () => {
      cy.intercept('GET', '**/api/essays/*/analyze', {
        statusCode: 200,
        body: { success: true, data: { analysis: null } },
      }).as('getAnalysis');
      cy.intercept('POST', '**/api/essays/*/analyze', {
        statusCode: 200,
        body: { success: true, data: { analysis: ANALYSIS_FIXTURE } },
      }).as('postAnalysis');

      cy.get('button[aria-label="Toggle Analysis sidebar"]').click();
      cy.wait('@getAnalysis');

      cy.get('aside[aria-label="Analysis"]').within(() => {
        cy.contains('button', 'Analyze Essay').click();
      });
      cy.wait('@postAnalysis');

      cy.get('aside[aria-label="Analysis"]').within(() => {
        cy.get('svg[aria-label="Essay score: 82 out of 100"]').should('exist');
        cy.contains('Style Recommendations').should('be.visible');
        cy.contains('This sentence is hard to follow.').should('be.visible');
        cy.contains('Spelling & Grammar').should('be.visible');
        cy.contains('recieve').should('be.visible');
        cy.contains(ANALYSIS_FIXTURE.overall_feedback).should('be.visible');
      });
    });

    it('applies a style rewrite and a spelling fix into the editor', () => {
      cy.intercept('GET', '**/api/essays/*/analyze', {
        statusCode: 200,
        body: { success: true, data: { analysis: ANALYSIS_FIXTURE } },
      }).as('getAnalysis');

      cy.get('button[aria-label="Toggle Analysis sidebar"]').click();
      cy.wait('@getAnalysis');

      cy.get('aside[aria-label="Analysis"]').within(() => {
        cy.contains('button', 'Apply rewrite').click();
        cy.contains('button', 'Applied').should('exist');

        cy.contains('button', 'Apply fix').click();
      });
    });

    it('forces a re-run via Re-analyze', () => {
      cy.intercept('GET', '**/api/essays/*/analyze', {
        statusCode: 200,
        body: { success: true, data: { analysis: ANALYSIS_FIXTURE } },
      }).as('getAnalysis');
      cy.intercept('POST', '**/api/essays/*/analyze', (req) => {
        expect(req.body).to.deep.equal({ force: true });
        req.reply({ statusCode: 200, body: { success: true, data: { analysis: ANALYSIS_FIXTURE } } });
      }).as('reanalyze');

      cy.get('button[aria-label="Toggle Analysis sidebar"]').click();
      cy.wait('@getAnalysis');

      cy.get('aside[aria-label="Analysis"]').within(() => {
        cy.contains('button', 'Re-analyze').click();
      });
      cy.wait('@reanalyze');
    });

    it('shows the upgrade modal when the analysis quota is exceeded', () => {
      cy.intercept('GET', '**/api/essays/*/analyze', {
        statusCode: 200,
        body: { success: true, data: { analysis: null } },
      }).as('getAnalysis');
      cy.intercept('POST', '**/api/essays/*/analyze', {
        statusCode: 402,
        body: {
          success: false,
          error: "You've used all 5 AI analyses for this month. Upgrade to Premium for unlimited access.",
          code: 'quota_exceeded',
          used: 5,
          limit: 5,
        },
      }).as('postAnalysisBlocked');

      cy.get('button[aria-label="Toggle Analysis sidebar"]').click();
      cy.wait('@getAnalysis');

      cy.get('aside[aria-label="Analysis"]').within(() => {
        cy.contains('button', 'Analyze Essay').click();
      });
      cy.wait('@postAnalysisBlocked');

      cy.contains('Monthly limit reached').should('be.visible');
      cy.contains('5 / 5').should('be.visible');
    });
  });

  // ── Outline panel ────────────────────────────────────────────────────────

  describe('Outline panel', () => {
    it('generates an outline and toggles item completion', () => {
      cy.intercept('GET', '**/api/essays/*/outline', {
        statusCode: 200,
        body: { success: true, data: { items: [] } },
      }).as('getOutline');
      cy.intercept('POST', '**/api/essays/*/outline', {
        statusCode: 200,
        body: { success: true, data: OUTLINE_FIXTURE },
      }).as('postOutline');
      cy.intercept('PATCH', '**/api/essays/*/outline', {
        statusCode: 200,
        body: { success: true, data: { item: { ...OUTLINE_FIXTURE.items[0], is_complete: true } } },
      }).as('patchOutline');

      cy.get('button[aria-label="Toggle Outline panel"]').click();
      cy.wait('@getOutline');

      cy.get('aside[aria-label="Essay outline"]').within(() => {
        cy.contains('button', 'Generate Outline').click();
      });
      cy.wait('@postOutline');

      cy.get('aside[aria-label="Essay outline"]').within(() => {
        cy.contains('Hook').should('be.visible');
        cy.contains('Main argument').should('be.visible');
        cy.get('button[aria-label="Mark complete"]').first().click();
      });
      cy.wait('@patchOutline');
    });

    it('shows the upgrade modal when the outline quota is exceeded', () => {
      cy.intercept('GET', '**/api/essays/*/outline', {
        statusCode: 200,
        body: { success: true, data: { items: [] } },
      }).as('getOutline');
      cy.intercept('POST', '**/api/essays/*/outline', {
        statusCode: 402,
        body: {
          success: false,
          error: "You've used all 3 outline generations for this month. Upgrade to Premium for unlimited access.",
          code: 'quota_exceeded',
          used: 3,
          limit: 3,
        },
      }).as('postOutlineBlocked');

      cy.get('button[aria-label="Toggle Outline panel"]').click();
      cy.wait('@getOutline');

      cy.get('aside[aria-label="Essay outline"]').within(() => {
        cy.contains('button', 'Generate Outline').click();
      });
      cy.wait('@postOutlineBlocked');

      cy.contains('Monthly limit reached').should('be.visible');
      cy.contains('3 / 3').should('be.visible');
    });
  });
});

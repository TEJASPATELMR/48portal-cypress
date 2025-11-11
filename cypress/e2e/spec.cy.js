/// <reference types="cypress" />

describe('48.ie Login Test', () => {
  const url = 'https://staging.48.ie/log-in';
  const email = 'archana_purushotham+harry@thbs.com';
  const password = 'Thbs123!';

  beforeEach(() => {
    Cypress.on('uncaught:exception', (err) => {
      // Ignore known third-party LivePerson errors
      if (/lpTag\.newPage|Script error/i.test(err.message)) return false;
      return true;
    });
  });

  it('logs into the site', () => {
    // Visit login page
    cy.visit(url, {
      onBeforeLoad(win) {
        // stub lpTag to prevent LivePerson errors
        win.lpTag = win.lpTag || {};
        win.lpTag.newPage = () => {};
      },
    });

    cy.document().its('readyState').should('eq', 'complete');

    // Accept cookie popup if shown
    cy.contains('button', /accept all cookies/i, { timeout: 4000 })
      .click({ force: true })
      .then(() => cy.log('Accepted cookies'))
      .catch(() => cy.log('No cookie popup found'));

    // Fill email and password
    cy.get('input[placeholder*="email"]', { timeout: 8000 })
      .should('be.visible')
      .type(email);

    cy.get('input[placeholder*="password"]')
      .should('be.visible')
      .type(password, { log: false });

    // Click Sign In
    cy.contains('button', /sign in/i).click({ force: true });

    // Verify navigation away from login page
    cy.location('pathname', { timeout: 15000 }).should(
      (path) => expect(path.toLowerCase()).not.to.include('/log-in')
    );
  });
});

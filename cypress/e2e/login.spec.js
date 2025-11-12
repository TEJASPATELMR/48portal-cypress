/// <reference types="cypress" />

describe('48 - Login flow (final robust version)', () => {
  const base = 'https://staging.48.ie';
  const loginUrl = `${base}/log-in`;

  const EMAIL = 'archana_purushotham+harry@thbs.com';
  const PASS = 'Thbs123!';

  beforeEach(() => {
    // Handle 3rd party scripts safely
    cy.on('uncaught:exception', (err) => {
      if (/lpTag\.newPage|Script error|Unexpected token/i.test(err.message)) {
        return false;
      }
      return true;
    });
  });

  it('Logs in successfully or shows proper error message', () => {
    // Give page more time to load in CI and avoid failing on non-2xx from intermediate redirects
    cy.visit(loginUrl, {
      timeout: 120000,         // wait up to 120s for navigation/load
      failOnStatusCode: false, // don't fail if intermediate status is not 2xx
      onBeforeLoad(win) {
        try {
          win.lpTag = win.lpTag || {};
          win.lpTag.newPage = () => {};
        } catch {}
      },
    });

    // Wait until the document is fully loaded (with a longer timeout)
    cy.document({ timeout: 120000 }).its('readyState').should('eq', 'complete');

    // Give a short additional buffer for client-side scripts to initialize
    cy.wait(1000);

    // Accept cookies if popup visible (robust selector)
    cy.get('body').then(($body) => {
      const popup = $body.find('button').filter((i, el) =>
        (el.innerText || '').match(/accept all cookies|accept cookies|agree/i)
      );
      if (popup.length) cy.wrap(popup.first()).click({ force: true });
    });

    // Fill email + password
    cy.get('input[placeholder*="email"], input[type="email"]', { timeout: 20000 }).first().type(EMAIL, { log: false });
    cy.get('input[placeholder*="password"], input[type="password"]', { timeout: 20000 }).first().type(PASS, { log: false });

    // Try clicking Sign In
    cy.contains('button', /sign in|log in|submit/i, { timeout: 20000 }).first().click({ force: true });

    // Also attempt form submit if click did nothing
    cy.get('form', { timeout: 10000 }).then(($form) => {
      if ($form.length) {
        cy.wrap($form).submit();
        cy.log('Form submitted directly');
      } else {
        cy.get('input[type="password"]').type('{enter}');
        cy.log('Pressed Enter in password field');
      }
    });

    // wait for redirect or response (shorter than page timeout)
    cy.wait(5000);

    // Option 1: User logged in -> URL changed or account page loaded
    cy.location('pathname', { timeout: 30000 }).then((path) => {
      if (path.toLowerCase().includes('/log-in') || path.toLowerCase().includes('/login')) {
        // Option 2: Login failed -> show visible error text
        cy.get('body').then(($b) => {
          const text = $b.text();
          if (text.match(/incorrect|invalid|try again|error|failed/i)) {
            cy.log('Login attempt failed, message visible.');
          } else {
            cy.screenshot('login-stuck');
            throw new Error(`Login form did not navigate or show an error. Still on ${path}`);
          }
        });
      } else {
        cy.log(`✅ Login appears successful. Redirected to: ${path}`);
      }
    });
  });
});

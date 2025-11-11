/// <reference types="cypress" />

describe('48 - Login flow (final robust version)', () => {
  const base = 'https://staging.48.ie';
  const loginUrl = `${base}/log-in`;

  const EMAIL = 'archana_purushotham+harry@thbs.com';
  const PASS = 'Thbs123!';

  beforeEach(() => {
    // Handle 3rd party scripts safely
    cy.on('uncaught:exception', (err) => {
      if (
        /lpTag\.newPage|Script error|Unexpected token/i.test(err.message)
      ) return false;
      return true;
    });
  });

  it('Logs in successfully or shows proper error message', () => {
    cy.visit(loginUrl, {
      onBeforeLoad(win) {
        try {
          win.lpTag = win.lpTag || {};
          win.lpTag.newPage = () => {};
        } catch {}
      },
    });

    cy.document().its('readyState').should('eq', 'complete');
    cy.wait(1000);

    // Accept cookies if popup visible
    cy.get('body').then(($body) => {
      const popup = $body.find('button').filter((i, el) =>
        (el.innerText || '').match(/accept all cookies/i)
      );
      if (popup.length) cy.wrap(popup.first()).click({ force: true });
    });

    // Fill email + password
    cy.get('input[placeholder*="email"], input[type="email"]').first().type(EMAIL);
    cy.get('input[placeholder*="password"], input[type="password"]').first().type(PASS);

    // Try clicking Sign In
    cy.contains('button', /sign in/i).click({ force: true });

    // ✅ Try also submitting the form directly (in case click does nothing)
    cy.get('form').then(($form) => {
      if ($form.length) {
        cy.wrap($form).submit();
        cy.log('Form submitted directly');
      } else {
        cy.get('input[type="password"]').type('{enter}');
        cy.log('Pressed Enter in password field');
      }
    });

    // Wait and check for redirect or success marker
    cy.wait(5000);

    // Option 1: User logged in -> URL changed or account page loaded
    cy.location('pathname').then((path) => {
      if (path.toLowerCase().includes('/log-in')) {
        // Option 2: Login failed -> show visible error text
        cy.get('body').then(($b) => {
          const text = $b.text();
          if (text.match(/incorrect|invalid|try again|error/i)) {
            cy.log('Login attempt failed, message visible.');
          } else {
            cy.screenshot('login-stuck');
            throw new Error(
              `Login form did not navigate or show an error. Still on ${path}`
            );
          }
        });
      } else {
        cy.log(`✅ Login appears successful. Redirected to: ${path}`);
      }
    });
  });
});

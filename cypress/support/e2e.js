// cypress/support/e2e.js

// Narrow uncaught:exception handler - ignore only specific known benign messages.
Cypress.on('uncaught:exception', (err) => {
  const msg = err && err.message ? err.message : '';

  const ignorePatterns = [
    /lpTag\.newPage is not a function/i,
    /^Script error\.$/i,
    /^Unexpected token '</i
  ];

  if (ignorePatterns.some(rx => rx.test(msg))) {
    return false;
  }

  return true;
});

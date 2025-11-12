const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // point to your app root — tests should visit paths like '/log-in'
    baseUrl: 'https://staging.48.ie',

    // keep spec pattern
    specPattern: 'cypress/e2e/**/*.spec.js',

    // your support file (leave as-is if it exists)
    supportFile: 'cypress/support/e2e.js',

    // timeouts tuned for CI
    pageLoadTimeout: 120000,        // wait up to 120s for page load
    requestTimeout: 15000,          // network request timeout
    defaultCommandTimeout: 15000,   // your existing command timeout

    viewportWidth: 1280,
    viewportHeight: 900,

    setupNodeEvents(on, config) {
      // simple task to print logs from the spec to the terminal
      on('task', {
        log(message) {
          // print in Node process so you can see logs in terminal
          // eslint-disable-next-line no-console
          console.log(message);
          return null;
        },
      });

      return config;
    },
  },
});

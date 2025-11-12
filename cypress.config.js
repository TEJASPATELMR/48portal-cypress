
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://staging.48.ie/log-in',
    specPattern: 'cypress/e2e/**/*.spec.js',
    supportFile: 'cypress/support/e2e.js',
    defaultCommandTimeout: 15000,
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

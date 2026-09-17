// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

if (Cypress.env('capture')) {
  // Recording mode (`CYPRESS_capture=true npx cypress run ...`, run against a
  // real dev server + live-data-backed API): logs every GraphQL request/
  // response pair to cypress/fixtures/graphql/captures/<OperationName>.json,
  // deduped by request variables, so it can be replayed offline afterwards
  // via cy.mockGraphQL(). Re-run this whenever the underlying data changes
  // enough that specs need a fresh snapshot.
  beforeEach(() => {
    cy.captureGraphQLTraffic();
  });
  afterEach(() => {
    cy.flushCapturedGraphQL();
  });
}
// Default mode: specs call cy.mockGraphQL() themselves (optionally with
// overrides layered on top, see searchfacet_checkbox.cy.js) before visiting
// a page, replaying previously captured GraphQL responses instead of hitting
// the live API. Kept per-spec (rather than a single global intercept here) so
// a spec's own overrides don't have to coexist with a second, competing
// intercept.

// beforeEach(() => {
//   cy.wait(1000)
// })



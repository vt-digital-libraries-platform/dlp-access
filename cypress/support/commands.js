const Auth = require("aws-amplify").Auth;
import "cypress-file-upload";
import "cypress-localstorage-commands";
import { Amplify } from "aws-amplify";
import config from "../../src/aws-exports";
const username = "devtest";
const password = Cypress.env("password");

Amplify.configure(config);
const awsconfig = {
  aws_user_pools_id: Amplify.Auth._config.aws_user_pools_id,
  aws_user_pools_web_client_id:
    Amplify.Auth._config.aws_user_pools_web_client_id
};
Auth.configure(awsconfig);

Cypress.Commands.add("signIn", () => {
  cy.then(() => Auth.signIn(username, password)).then((cognitoUser) => {
    const idToken = cognitoUser.signInUserSession.idToken.jwtToken;
    const accessToken = cognitoUser.signInUserSession.accessToken.jwtToken;
    const makeKey = (name) =>
      `CognitoIdentityServiceProvider.${cognitoUser.pool.clientId}.${cognitoUser.username}.${name}`;
    cy.setLocalStorage(makeKey("accessToken"), accessToken);
    cy.setLocalStorage(makeKey("idToken"), idToken);
    cy.setLocalStorage(
      `CognitoIdentityServiceProvider.${cognitoUser.pool.clientId}.LastAuthUser`,
      cognitoUser.username
    );
  });
  cy.saveLocalStorage();
});

// Only active when running with `CYPRESS_capture=true` against a real,
// live-data-backed API. Records every GraphQL request/response pair the app
// makes so it can be replayed offline via cy.mockGraphQL() afterwards.
//
// cy.task can't be called from inside an intercept's req/res callback (it
// runs outside the Cypress command queue), so captures are buffered in memory
// and flushed with cy.task in a normal command chain (see flushCapturedGraphQL
// / support/e2e.js's afterEach).
if (Cypress.env("capture")) {
  let capturedRequests = [];

  Cypress.Commands.add("captureGraphQLTraffic", () => {
    cy.intercept("POST", "**/graphql", (req) => {
      const match = /^\s*(?:query|mutation)\s+(\w+)/.exec(req.body?.query ?? "");
      const operationName = match ? match[1] : null;
      req.continue((res) => {
        if (operationName) {
          capturedRequests.push({
            operationName,
            variables: req.body.variables,
            response: res.body
          });
        }
      });
    });
  });

  Cypress.Commands.add("flushCapturedGraphQL", () => {
    const toFlush = capturedRequests;
    capturedRequests = [];
    return cy.task("captureGraphQL", toFlush);
  });
}

// Replays previously captured GraphQL responses (see cypress/fixtures/graphql/
// captures, populated by a `CYPRESS_capture=true` run against the live API)
// so specs never depend on the live backend's current data. Matches a request
// to a captured entry by operation name + exact variables; anything
// uncaptured gets an empty-but-well-formed response so the app doesn't crash,
// and a warning is logged to help diagnose gaps.
//
// `overrides` lets a spec layer extra scenarios (or replace captured ones) by
// operation name: { OperationName: [{ variables, response }, ...] }.
Cypress.Commands.add("mockGraphQL", (overrides = {}) => {
  cy.task("loadGraphQLCaptures").then((captures) => {
    cy.intercept("POST", "**/graphql", (req) => {
      const match = /^\s*(?:query|mutation)\s+(\w+)/.exec(req.body?.query ?? "");
      const operationName = match ? match[1] : null;
      const entries = overrides[operationName] || captures[operationName] || [];
      const variablesKey = JSON.stringify(req.body?.variables ?? {});
      const found = entries.find(
        (entry) => JSON.stringify(entry.variables ?? {}) === variablesKey
      );
      if (found) {
        req.reply(found.response);
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `mockGraphQL: no captured fixture for ${operationName}`,
          req.body?.variables
        );
        req.reply({ data: {} });
      }
    }).as("graphql");
  });
});

import "cypress-file-upload";
import "cypress-localstorage-commands";

const username = "devtest";
const password = Cypress.env("password");

let cognitoConfigured = false;
let Auth;

try {
  // Real Amplify aws-exports is gitignored and absent in mock-only setups.
  // Admin specs that call cy.signIn still need it; a11y smoke specs do not.
  Auth = require("aws-amplify").Auth;
  const { Amplify } = require("aws-amplify");
  const config = require("../../src/aws-exports").default;
  Amplify.configure(config);
  const awsconfig = {
    aws_user_pools_id: Amplify.Auth._config.aws_user_pools_id,
    aws_user_pools_web_client_id:
      Amplify.Auth._config.aws_user_pools_web_client_id
  };
  Auth.configure(awsconfig);
  cognitoConfigured = true;
} catch (error) {
  // Continue without Cognito — mock a11y runs and machines without Amplify setup.
  cognitoConfigured = false;
}

Cypress.Commands.add("signIn", () => {
  if (!cognitoConfigured) {
    throw new Error(
      "cy.signIn requires src/aws-exports.js (run amplify pull/push). Mock mode does not support Cognito."
    );
  }
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

Cypress.Commands.add("graphqlRequest", (query, variables) => {
  cy.request({
    method: "POST",
    url: Cypress.env("apiUrl"),
    headers: {
      "x-api-key": Cypress.env("apiKey"),
      "Content-Type": "application/json"
    },
    body: {
      query: query,
      variables: variables
    }
  });
});

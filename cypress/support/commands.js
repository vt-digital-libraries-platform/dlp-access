import "cypress-file-upload";
import "cypress-localstorage-commands";
import { Amplify } from "aws-amplify";
import { fetchAuthSession, getCurrentUser, signIn } from "aws-amplify/auth";
import config from "../../src/amplifyconfiguration.json";
const username = "devtest";
const password = Cypress.env("password");

Amplify.configure(config);

Cypress.Commands.add("signIn", () => {
  cy.then(async () => {
    await signIn({ username, password });
    const { tokens } = await fetchAuthSession();
    const user = await getCurrentUser();
    return { tokens, user };
  }).then(({ tokens, user }) => {
    const clientId = config.aws_user_pools_web_client_id;
    const makeKey = (name) =>
      `CognitoIdentityServiceProvider.${clientId}.${user.username}.${name}`;
    cy.setLocalStorage(makeKey("accessToken"), tokens.accessToken.toString());
    cy.setLocalStorage(makeKey("idToken"), tokens.idToken.toString());
    cy.setLocalStorage(
      `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`,
      user.username
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

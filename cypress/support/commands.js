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

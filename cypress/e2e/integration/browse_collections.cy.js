describe("browse_collections: Browse collections page", () => {
  beforeEach(() => {
    cy.visit("/collections");
  });

  it("finds the first collection sorted by title as default", () => {
    cy.get(".gallery-item")
      .first()
      .as("firstCollection")
      .contains("Charlie Brouwer Collection");
    cy.get("@firstCollection").click();
    cy.url({ timeout: 2000 }).should("include", "/collection/0f04aba5");
    cy.contains("Brouwer");
  });

  it("renders the first 10 collections by default number of results to be showed", () => {
    cy.get(".gallery-item").should("have.length", 10);
  });

  it("renders all the collections if increasing the number of results to be showed", () => {
    cy.get("#results-number-dropdown").select("50");
    cy.get(".gallery-item").should("have.length", 11);
  });
});

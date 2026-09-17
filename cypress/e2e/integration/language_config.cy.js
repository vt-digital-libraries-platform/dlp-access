describe("language_config: Selecting English filters search results", () => {
  it("Language checkbox exists and updates url", () => {
    cy.mockGraphQL();
    cy.visit("/search");
    cy.wait(1000);
    cy.get("[data-cy=filter-collapsibles]")
      .find("button#category")
      .click({ force: true })
      .invoke("text")
      .should("equal", "Category");
    cy.get("input#archive", { timeout: 2000 }).click();
    cy.get("[data-cy=filter-collapsibles]")
      .find("button#language")
      .click({ force: true })
      .invoke("text")
      .should("equal", "Language");
    cy.get("input#en", { timeout: 2000 }).click();
    cy.wait(1000);
    cy.url().should("include", "language=en");
  });

  it("Items should now be tagged with English as the language", () => {
    cy.mockGraphQL();
    cy.visit("/search");
    cy.wait(1000);
    cy.get("[data-cy=filter-collapsibles]")
      .find("button#category")
      .click({ force: true });
    cy.get("input#archive", { timeout: 2000 }).click();
    cy.get("[data-cy=filter-collapsibles]")
      .find("button#language")
      .click({ force: true });
    cy.get("input#en", { timeout: 2000 }).click();
    cy.wait(1000);
    cy.get(".gallery-item").first().find("a").first().click();
    cy.wait(1000);
    cy.url().should("include", "/archive/");
    cy.get(".collapsible-cards-container details.card-details", { timeout: 5000 })
      .first()
      .contains("dt.data-list-label", "Language")
      .next("dd.data-list-value")
      .invoke("text")
      .should("equal", "en");
  });
});

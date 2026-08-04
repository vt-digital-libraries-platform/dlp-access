describe("a11y: browse collections", () => {
  it("loads the collections browse page", () => {
    cy.visit("/collections");
    cy.get("body").should("be.visible");
    cy.get(".gallery-item", { timeout: 15000 }).should("have.length.at.least", 1);
  });
});

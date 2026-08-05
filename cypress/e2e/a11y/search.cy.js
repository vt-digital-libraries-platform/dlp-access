describe("a11y: search page", () => {
  it("loads the search page", () => {
    cy.visit("/search");
    cy.get("body").should("be.visible");
    cy.get(".searchbar-wrapper", { timeout: 15000 }).should("exist");
    cy.get(".searchbar-wrapper input").should("be.visible");
  });
});

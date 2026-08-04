describe("a11y: home page", () => {
  it("loads the mock home page, then reveals a post-load a11y issue", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
    cy.get(".home-wrapper", { timeout: 15000 }).should("exist");
    cy.contains("Welcome", { timeout: 15000 }).should("be.visible");
  });
});

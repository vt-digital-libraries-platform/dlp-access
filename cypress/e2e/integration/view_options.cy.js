describe("view_options: Interaction", () => {
  beforeEach(() => {
    cy.mockGraphQL();
    cy.visit("/collections");
  });

  it('should display list viewing style if "list" viewing option is selected', () => {
    cy.get("button[title='List view']").click();
    cy.get(".collection-entry").should("have.length", 10);
  });

  it('should display gallery viewing style if "gallery" viewing option is selected', () => {
    cy.get("button[title='Gallery view']").click();
    cy.get(".gallery-item").should("have.length", 10);
  });
});

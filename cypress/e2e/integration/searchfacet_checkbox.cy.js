describe("searchfacet_checkbox: Search facet checkboxes correspond to the facet values of a facet field", () => {
  beforeEach(() => {
    // The live site's configured facets only expose a couple of values each
    // (category, language), so a synthetic "medium" facet is stubbed onto the
    // site config response to exercise multi-value checkbox selection.
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.query?.includes("siteBySiteId")) {
        req.continue((res) => {
          const site = res.body.data.siteBySiteId.items[0];
          const searchPage = JSON.parse(site.searchPage);
          searchPage.facets.medium = {
            label: "Medium",
            values: ["Colored Pencil", "Photographic Print - Black and White", "Ink"]
          };
          site.searchPage = JSON.stringify(searchPage);
        });
      }
    });
    cy.visit("/search");
    cy.get("button#medium").click();
    cy.wait(1000);
  });

  it("allows to select one of the checkboxes", () => {
    cy.get("input#colored_pencil", { timeout: 5000 }).check();
    cy.url().should("contain", "medium=Colored+Pencil");
    cy.get("[data-cy=search-filter-field-value-pairs]")
      .invoke("text")
      .should("contain", "Medium", "Colored Pencil");
  });

  it("allows to select more than one checkboxes", () => {
    cy.get("input#colored_pencil", { timeout: 5000 }).check();
    cy.get("input#photographic_print_-_black_and_white")
      .should("be.visible")
      .check();

    cy.url()
      .should("contain", "medium=Colored+Pencil")
      .and("contain", "medium=Photographic+Print+-+Black+and+White");
    cy.get("[data-cy=search-filter-field-value-pairs]")
      .invoke("text")
      .should("contain", "Medium", "Colored Pencil")
      .and("contain", "Medium", "Photographic Print - Black and White");
  });
});

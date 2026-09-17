describe('show_all_less_buttons: Search Facet field with more than 5 selectable values', () => {
  beforeEach(() => {
    // The live site's configured facets (category, language) only have a
    // couple of values each, so a synthetic "medium" facet with 9 values is
    // stubbed onto the site config response to exercise the show all/less
    // behavior in Collapsible.js.
    cy.intercept("POST", "**/graphql", (req) => {
      if (req.body?.query?.includes("siteBySiteId")) {
        req.continue((res) => {
          const site = res.body.data.siteBySiteId.items[0];
          const searchPage = JSON.parse(site.searchPage);
          searchPage.facets.medium = {
            label: "Medium",
            values: [
              "Colored Pencil",
              "Ink",
              "Charcoal",
              "Oil Paint",
              "Watercolor",
              "Pastel",
              "Graphite",
              "Pen and Ink",
              "Mixed Media"
            ]
          };
          site.searchPage = JSON.stringify(searchPage);
        });
      }
    });
    cy.visit('/search');
    cy.get('button#medium')
      .click().wait(1000);
  });

  it('displays the first 5 facet values', () => {
    cy.get('div.medium > div > div.facet-listing', { timeout: 5000 })
      .should("be.visible");

    cy.get('div.medium > div > div.facet-listing', { timeout: 5000 })
      .children()
      .should('have.length', 5);
  });

  it('displays all facet values if all button is clicked', () => {
    cy.get('div.medium > div > div.facet-listing', { timeout: 5000 })
      .should('be.visible');
    cy.get('[data-cy=show-all-button]', { timeout: 5000 })
      .should('have.text', 'Show All')
      .click({force: true});
    cy.get('div.medium > div > div.facet-listing', { timeout: 5000 })
      .children()
      .should('have.length', 9);
    cy.get('div.medium > div > div.facet-listing', { timeout: 5000 })
      .should('have.class', 'scroll');
    cy.get('div.medium > div > div.facet-listing > :nth-child(9) input', { timeout: 5000 })
      .should('not.be.visible');
    cy.get('div.medium > div > div.facet-listing > :nth-child(9) input', { timeout: 5000 }).scrollIntoView()
      .should('be.visible');
    cy.get('[data-cy=show-less-button]').should('have.text', 'Show Less');
  });
})

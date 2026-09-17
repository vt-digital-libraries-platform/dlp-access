describe('search_facet: Heading text', () => {
  it('contains the correct title', () => {
    cy.visit('/search');
    cy.get('h2')
      .invoke('text')
      .should('equal', 'Filter My Results');
  });
});

describe('search_facet: Collapsible search filter field', () => {
  beforeEach(() => {
    cy.visit('/search');
  });

  it('displays the facet field while hiding the list of facet values', () => {
    cy.get('div#sidebar div.facet-fields')
      .should('exist');
    cy.get('[data-cy=filter-collapsibles] .facet-listing')
      .should('not.exist');
    cy.get('button#category')
      .invoke('text')
      .should('equal', 'Category');
    cy.get('button#language')
      .invoke('text')
      .should('equal', 'Language');
  });

  it('displays the list of facet values after the facet field being expanded', () => {
    cy.get('[data-cy=filter-collapsibles] > .category > div > div.facet-listing')
        .should('not.exist');
    cy.get('button#category')
        .click();
    cy.get('[data-cy=filter-collapsibles] > .category > div > div.facet-listing', { timeout: 5000 })
        .should('be.visible');
  });
})

describe('search_bar: Search by clicking the search button', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('#searchbar-text-input').clear().type('Additions');
    cy.get('.searchbar-wrapper button[type=submit]').click();
    cy.wait(1000);
  });

  it('returns resulting objects across all fields with the term searched', () => {
    cy.url()
      .should('eq', 'http://localhost:3000/search?field=all&q=Additions&view=Gallery');
    cy.get('.pagination-text', { timeout: 5000 }).first()
      .invoke('text')
      .should('equal', 'Search Results: 1 - 10 of 63');

    cy.get('#search-results .gallery-item')
      .should('have.length', 10);
  });
});

describe('search_bar: Search by hitting enter key', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('#searchbar-text-input').clear().type('certificate{enter}');
    cy.wait(1000);
  });

  it('returns resulting objects across all fields with the term searched', () => {
    cy.url()
      .should('eq', 'http://localhost:3000/search?field=all&q=certificate&view=Gallery');
    cy.get('.pagination-text', { timeout: 5000 }).first()
      .invoke('text')
      .should('equal', 'Search Results: 1 - 10 of 20');

    cy.get('#search-results .gallery-item')
      .should('have.length', 10);
  });
});

describe('search_bar: Search with parentheses in the query', () => {
  beforeEach(() => {
    cy.visit('/search');
    cy.get('#searchbar-text-input')
      .clear()
      .type('Diazotypes (copies){enter}');
    cy.wait(1000);
  });

  it('returns resulting objects with full text search', () => {
    cy.url()
      .should('eq', 'http://localhost:3000/search?field=all&q=Diazotypes%20%28copies%29&view=Gallery');
    cy.get('.pagination-text', { timeout: 5000 }).first()
      .invoke('text')
      .should('contain', 'Search Results: 1 - 10 of ');

    cy.get('#search-results .gallery-item')
      .should('have.length', 10);
  });
});

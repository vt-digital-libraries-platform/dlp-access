describe('additional_pages: Site nav menu', () => {
  it('shows generated About link', () => {
    cy.visit('/');
    cy.get('.top-navbar .navbar-nav')
      .contains('a', 'ABOUT')
      .should('be.visible');
  });
});

describe('additional_pages: About link', () => {
  it('links to correct About page', () => {
    cy.visit('/');
    cy.get('.top-navbar .navbar-nav')
      .contains('a', 'ABOUT')
      .click();
    cy.url().should('include', '/about');
    cy.get('.secondary-page h1')
      .invoke('text')
      .should('contain', 'About');
  });
});

describe('linked_metadata: Archive metadata', () => {
  beforeEach(() => {
    cy.mockGraphQL();
    cy.visit('/archive/67474c70').wait(1000);
    cy.get('.collapsible-cards-container details.card-details')
      .first()
      .as('aboutCard');
  });

  it('Type value links to a search filtered by that type', () => {
    cy.get('@aboutCard')
      .contains('dt.data-list-label', 'Type')
      .next('dd.data-list-value')
      .find('a')
      .click();
    cy.url({ timeout: 2000 })
      .should('eq', 'http://localhost:3000/search?q=&field=all&view=Gallery&type=Image');
  });

  it('Format value links to a search filtered by that format', () => {
    cy.get('@aboutCard')
      .contains('dt.data-list-label', 'Format')
      .next('dd.data-list-value')
      .find('a')
      .click();
    cy.url({ timeout: 2000 })
      .should('eq', 'http://localhost:3000/search?q=&field=all&view=Gallery&format=image/tiff');
  });
});

describe('linked_metadata: Collection metadata', () => {
  it('lands on search facet by the metadata field', () => {
    cy.mockGraphQL();
    cy.visit('/collection/0f04aba5');
    cy.wait(1500);
    cy.get('tr.language td.collection-detail-value a')
      .click();
    cy.url({ timeout: 2000 })
      .should('eq', 'http://localhost:3000/search/?category=collection&field=title&language=en&q=&view=Gallery');
  });
});

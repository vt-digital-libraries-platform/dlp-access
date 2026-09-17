describe('collection_metadata_display: A single Collection Show page metadata section', () => {
  beforeEach(() => {
    cy.visit('/collection/0f04aba5').wait(1000);
  })

  it('displays the identifier field and its corresponding value', () => {
    cy.get('td.collection-detail-value.identifier > a', {timeout: 5000})
      .contains('cbcst')
      .should('be.visible')
      cy.get('td.collection-detail-value.identifier > a', {timeout: 5000}).click().wait(1000);
    cy.url({ timeout: 2000 }).should('include', '/collection/0f04aba5');
  })

  it('displays the creator field linking to a search filtered by that creator', () => {
    cy.get('tr.creator td.collection-detail-value a', {timeout: 5000})
      .contains('Brouwer, Charlie, 1946')
      .click();
    cy.url({ timeout: 2000 })
      .should('include', 'creator=Brouwer%2C%20Charlie%2C%201946');
  })
})

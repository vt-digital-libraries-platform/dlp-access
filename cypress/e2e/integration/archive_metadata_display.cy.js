describe('archive_metadata_display: A single Archive Show page "About" metadata card', () => {
  beforeEach(() => {
    cy.mockGraphQL();
    cy.visit('/archive/67474c70').wait(1000);
    cy.get('.collapsible-cards-container details.card-details', { timeout: 5000 })
      .first()
      .as('aboutCard');
  })

  it('displays the identifier field and its corresponding value', () => {
    cy.get('@aboutCard')
      .contains('dt.data-list-label', 'Identifier')
      .invoke('text')
      .should('equal', 'Identifier');
    cy.get('@aboutCard')
      .contains('dt.data-list-label', 'Identifier')
      .next('dd.data-list-value')
      .invoke('text')
      .should('equal', 'TAU_ART_000885_0001');
  })

  it('displays the "Belongs to" field with the parent collection name', () => {
    cy.get('@aboutCard')
      .contains('dt.data-list-label', 'Belongs to')
      .next('dd.data-list-value')
      .invoke('text')
      .should('equal', 'Taubman Museum of Art');
  })

  it('links to the parent collection show page via the breadcrumbs', () => {
    cy.get('.breadcrumbs-wrapper #vt_navtrail')
      .contains('a', 'Taubman Museum of Art')
      .click();
    cy.url({ timeout: 2000 }).should('include', '/collection/8n449w6w');
  })
})

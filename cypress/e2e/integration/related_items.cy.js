describe("related_items: Related items on archives page", () => {

    it("Related items section shows on the page", () => {
        cy.mockGraphQL();
        cy.visit("/archive/67474c70");
        cy.get(".related-items-wrapper", { timeout: 10000 }).should("be.visible");
    })

    it("Carousel populates with related item slides", () => {
        cy.mockGraphQL();
        cy.visit("/archive/67474c70");
        cy.get(".slick-slide", { timeout: 10000 }).should("have.length.greaterThan", 0);
    })

    it("Carousel populates for an item in a different collection", () => {
        cy.mockGraphQL();
        cy.visit("/archive/b728f982");
        cy.get(".slick-slide", { timeout: 10000 }).should("have.length.greaterThan", 0);
    });

    it("Carousel populates for a PDF item", () => {
        cy.mockGraphQL();
        cy.visit("/archive/d98abeb2");
        cy.get(".slick-slide", { timeout: 10000 }).should("have.length.greaterThan", 0);
    })

    it("Carousel populates for a 3D model item", () => {
        cy.mockGraphQL();
        cy.visit("/archive/4339dbe9");
        cy.get(".slick-slide", { timeout: 10000 }).should("have.length.greaterThan", 0);
    });

})

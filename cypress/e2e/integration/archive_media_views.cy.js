// The site's current dataset (federated demo: insect specimens, art,
// architectural drawings, PDFs, 3D scans, and IIIF-tiled images) does not
// currently include audio, video, Kaltura, plain static-image, X3D, or
// Minerva-exhibit items, so only the media viewers with real reachable
// content are covered here: the Mirador/IIIF viewer, the PDF viewer, and
// the Babylon.js 3D model viewer.

describe("archive_media_views: Archive Mirador/IIIF viewer", () => {
  it("renders the Mirador viewer for an item with a IIIF manifest", () => {
    cy.mockGraphQL();
    cy.visit("/archive/b728f982");
    cy.get("#mirador_viewer main", { timeout: 10000 })
      .should("have.class", "mirador-viewer")
      .should("be.visible");
    cy.get("#mirador_viewer canvas", { timeout: 10000 }).should("be.visible");
  });
});

describe("archive_media_views: Archive pdf embed", () => {
  it("renders pdf file inside an object element", () => {
    cy.mockGraphQL();
    cy.visit("/archive/d98abeb2");
    cy.get("#item-media-col > object", { timeout: 20000 })
      .eq(0)
      .should("have.id", "pdf-object")
      .should("be.visible");
  });
});

describe("archive_media_views: Archive 3D model viewer", () => {
  it("renders the Babylon.js viewer for a gltf record", () => {
    cy.mockGraphQL();
    cy.visit("/archive/4339dbe9");
    cy.get(".babylon-viewer-section #canvas-wrapper canvas", { timeout: 15000 })
      .should("be.visible");
  });
});

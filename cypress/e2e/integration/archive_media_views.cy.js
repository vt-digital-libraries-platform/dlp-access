describe("archive_media_views: Archive static img view", () => {
  it("shows correct img tag", () => {
    cy.visit("/archive/m58xyh90");
    cy.get("img.item-img").eq(0).should("be.visible");
  });
});

describe("archive_media_views: Archive audio player", () => {
  it("renders audio file thumbnail", () => {
    cy.visit("/archive/m69xyh01");
    cy.get("img.audio-img", { timeout: 50000 }).should("be.visible");
  });
  it("renders html5 audio player", () => {
    cy.visit("/archive/m69xyh01").wait(1000);
    cy.get("audio").eq(0).should("have.id", "player1");
  });
});

describe("archive_media_views: Archive video player", () => {
  it("renders html5 video player", () => {
    cy.visit("/archive/m70xyh12").wait(1000);
    cy.get("video").eq(0).should("have.id", "player1").should("be.visible");
  });
  it("renders with img placeholder", () => {
    cy.visit("/archive/m70xyh12").wait(1000);
    cy.get("video")
      .invoke("attr", "poster")
      .should("eq", "http://i3.ytimg.com/vi/iWO5N3n1DXU/hqdefault.jpg");
  });
});

describe("archive_media_views: Archive kaltura embed", () => {
  it("renders kaltura video player inside iframe", () => {
    cy.visit("http://localhost:3000/archive/m81xyh23").wait(2000);
    cy.get("iframe")
      .eq(0)
      .should("have.class", "kaltura-player")
      .should("be.visible");
  });
});

describe("archive_media_views: Archive pdf embed", () => {
  it("renders pdf file inside canvas", () => {
    cy.visit("http://localhost:3000/archive/m92xyh34").wait(1000);
    cy.get("#item-media-col > object", { timeout: 20000 })
      .eq(0)
      .should("have.id", "pdf-object")
      .should("be.visible");
  });
});

describe("archive_media_views: Archive Mirador viewer", () => {
  it("renders viewer if manifest.json", () => {
    cy.visit("/archive/cv65x38f").wait(2000);
    cy.get("#mirador_viewer main.mirador-viewer")
      .should("exist")
      .and("be.visible");
    cy.get("#mirador_viewer .openseadragon-canvas canvas")
      .should("exist")
      .and("be.visible");
  });
});

describe("archive_media_views: Archive Minerva viewer", () => {
  it("renders viewer if exhibit.json", () => {
    cy.visit("/archive/s253n52s").wait(2000);
    cy.get("div#minerva-open-dialog")
      .eq(0)
      .should("be.visible")
      .should(
        "contain",
        "This record type requires a full screen image viewer."
      );
    cy.get("div#minerva-open-dialog > button").click({ force: true });
    cy.get("div.minerva-root").eq(0).should("be.visible");
  });
});

describe("archive_media_views: Archive 3d .x3d viewer", () => {
  it("renders 3d viewer for 3d .x3d records", () => {
    cy.visit("http://localhost:3000/archive/99249552").wait(4000);
    cy.get("div.obj-wrapper x3d#x3dElement canvas").eq(0).should("be.visible");
  });
});

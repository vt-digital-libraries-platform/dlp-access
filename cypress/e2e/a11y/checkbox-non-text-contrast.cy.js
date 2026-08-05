/**
 * WCAG SC 1.4.11 Non-text Contrast — facet checkboxes must expose bounds
 * with at least a 3:1 contrast ratio against adjacent colors.
 *
 * Search filter checkboxes use Bootstrap .form-check-input (appearance: none),
 * so the CSS border is what defines the control's visible edge.
 */
const { measureCheckboxBoundContrast } = require("../../support/contrast");

const MIN_NON_TEXT_CONTRAST = 3;

describe("a11y: WCAG SC 1.4.11 checkbox non-text contrast", () => {
  beforeEach(() => {
    // Facet sidebar (with checkboxes) is display:block from the lg breakpoint up.
    cy.viewport(1280, 900);
    cy.visit("/search");
    cy.get(".searchbar-wrapper", { timeout: 15000 }).should("exist");
    cy.get(".facet-wrapper", { timeout: 15000 }).should("be.visible");
  });

  it("requires ≥ 3:1 contrast between checkbox bounds and adjacent colors", () => {
    cy.get("[data-cy=filter-collapsible]").first().within(() => {
      cy.get("button").click();
    });

    cy.get("[data-cy=input-filter-checkbox]")
      .should("have.length.at.least", 1)
      .and("be.visible");

    cy.window().then((win) => {
      cy.get("[data-cy=input-filter-checkbox]:visible").then(($checkboxes) => {
        const failures = [...$checkboxes]
          .map((checkbox) => {
            const measurement = measureCheckboxBoundContrast(checkbox, win);
            return {
              id: checkbox.id || checkbox.name || "(unnamed)",
              ...measurement
            };
          })
          .filter((result) => !result.ok || result.ratio < MIN_NON_TEXT_CONTRAST);

        const summary = failures
          .map((f) => {
            if (f.reason) {
              return `${f.id}: ${f.reason}`;
            }
            return `${f.id}: ${f.ratio.toFixed(2)}:1 (border ${f.border} vs adjacent ${f.adjacent}; need ≥ ${MIN_NON_TEXT_CONTRAST}:1)`;
          })
          .join("\n");

        expect(
          failures,
          `WCAG SC 1.4.11 non-text contrast failures:\n${summary}`
        ).to.have.length(0);
      });
    });
  });
});

/**
 * ARIA Authoring Practices Guide (APG) — Disclosure (Show/Hide) Pattern
 * https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *
 * The search facet expansion widget (Collapsible) is a disclosure: a button
 * that shows or hides a section of facet values. This suite checks the APG
 * keyboard interactions and WAI-ARIA roles, states, and properties.
 */

function disclosureButton($facet) {
  return cy.wrap($facet).find("h3 button").first();
}

function firstDisclosureButton() {
  return cy.get("[data-cy=filter-collapsible]").first().find("h3 button");
}

function disclosurePanelId(buttonId) {
  return `${buttonId}-list`;
}

/**
 * Activate a focused native <button> the way browsers do for APG keys.
 * Enter fires click on keydown; Space fires click on keyup.
 * Prefer this over cy.type(), which can click-to-focus and double-toggle
 * once disclosed content (and other focusables) are in the tree.
 */
function activateFocusedButtonWithKey(key) {
  cy.focused().then(($btn) => {
    const el = $btn[0];
    const fire = (type, init) => {
      el.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }));
    };

    if (key === "Enter") {
      fire("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13 });
      el.click();
    } else if (key === " ") {
      fire("keydown", { key: " ", code: "Space", keyCode: 32, which: 32 });
      fire("keyup", { key: " ", code: "Space", keyCode: 32, which: 32 });
      el.click();
    } else {
      throw new Error(`Unsupported disclosure key: ${key}`);
    }
  });
}

describe("a11y: APG disclosure pattern — facet expansion", () => {
  beforeEach(() => {
    // Facet sidebar is display:block from the lg breakpoint up.
    cy.viewport(1280, 900);
    cy.visit("/search");
    cy.get(".searchbar-wrapper", { timeout: 15000 }).should("exist");
    cy.get(".facet-wrapper", { timeout: 15000 }).should("be.visible");
    cy.get("[data-cy=filter-collapsible]").should("have.length.at.least", 1);
  });

  describe("WAI-ARIA roles, states, and properties", () => {
    it("uses a button as the disclosure control", () => {
      cy.get("[data-cy=filter-collapsible]").each(($facet) => {
        disclosureButton($facet)
          .should("match", "button")
          .and("have.attr", "type", "button");
      });
    });

    it("sets aria-expanded to false when the facet values are hidden", () => {
      cy.get("[data-cy=filter-collapsible]").each(($facet) => {
        disclosureButton($facet).should(
          "have.attr",
          "aria-expanded",
          "false"
        );
        cy.wrap($facet)
          .parent()
          .find(".facet-listing")
          .should("not.exist");
      });
    });

    it("sets aria-expanded to true when the facet values are visible", () => {
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .then(($facet) => {
          disclosureButton($facet).click();
          disclosureButton($facet).should(
            "have.attr",
            "aria-expanded",
            "true"
          );
          cy.wrap($facet)
            .parent()
            .find(".facet-listing")
            .should("be.visible");
        });
    });

    it("updates aria-expanded when the disclosure is toggled closed again", () => {
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .then(($facet) => {
          disclosureButton($facet).as("trigger");
          cy.get("@trigger").click();
          cy.get("@trigger").should("have.attr", "aria-expanded", "true");
          cy.get("@trigger").click();
          cy.get("@trigger").should("have.attr", "aria-expanded", "false");
          cy.wrap($facet)
            .parent()
            .find(".facet-listing")
            .should("not.exist");
        });
    });

    it("recommends aria-controls referencing the disclosed content", () => {
      // Optional per the pattern overview; included in APG disclosure examples.
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .then(($facet) => {
          disclosureButton($facet).click();
          disclosureButton($facet)
            .should("have.attr", "id")
            .then((buttonId) => {
              const panelId = disclosurePanelId(buttonId);
              cy.wrap($facet)
                .parent()
                .find(`#${CSS.escape(panelId)}`)
                .should("be.visible");
              disclosureButton($facet).should(
                "have.attr",
                "aria-controls",
                panelId
              );
            });
        });
    });

    it("gives the disclosure button an accessible name", () => {
      cy.get("[data-cy=filter-collapsible]").each(($facet) => {
        disclosureButton($facet)
          .invoke("text")
          .then((text) => {
            expect(text.trim(), "disclosure button accessible name").to.have
              .length.of.at.least(1);
          });
      });
    });
  });

  describe("Keyboard interaction", () => {
    it("toggles the disclosure with Enter", () => {
      firstDisclosureButton().focus().should("have.focus");
      activateFocusedButtonWithKey("Enter");
      firstDisclosureButton().should("have.attr", "aria-expanded", "true");
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .parent()
        .find(".facet-listing")
        .should("be.visible");

      firstDisclosureButton().focus().should("have.focus");
      activateFocusedButtonWithKey("Enter");
      firstDisclosureButton().should("have.attr", "aria-expanded", "false");
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .parent()
        .find(".facet-listing")
        .should("not.exist");
    });

    it("toggles the disclosure with Space", () => {
      firstDisclosureButton().focus().should("have.focus");
      activateFocusedButtonWithKey(" ");
      firstDisclosureButton().should("have.attr", "aria-expanded", "true");
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .parent()
        .find(".facet-listing")
        .should("be.visible");

      firstDisclosureButton().focus().should("have.focus");
      activateFocusedButtonWithKey(" ");
      firstDisclosureButton().should("have.attr", "aria-expanded", "false");
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .parent()
        .find(".facet-listing")
        .should("not.exist");
    });

    it("keeps the disclosure button in the tab order", () => {
      firstDisclosureButton()
        .should("not.have.attr", "tabindex", "-1")
        .focus()
        .should("have.focus");
    });
  });

  describe("Content visibility", () => {
    it("removes disclosed content from the accessibility tree when collapsed", () => {
      // Collapsed content must not remain focusable (WebAIM / APG guidance).
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .then(($facet) => {
          cy.wrap($facet)
            .parent()
            .within(() => {
              cy.get(".facet-listing").should("not.exist");
              cy.get("[data-cy=input-filter-checkbox]").should("not.exist");
            });
        });
    });

    it("exposes disclosed content only while expanded", () => {
      cy.get("[data-cy=filter-collapsible]")
        .first()
        .then(($facet) => {
          disclosureButton($facet).click();
          cy.wrap($facet)
            .parent()
            .find(".facet-listing")
            .should("be.visible")
            .find("[data-cy=input-filter-checkbox]")
            .should("have.length.at.least", 1)
            .and("be.visible");

          disclosureButton($facet).click();
          cy.wrap($facet)
            .parent()
            .find(".facet-listing")
            .should("not.exist");
        });
    });

    it("allows independent expansion of multiple facet disclosures", () => {
      // Disclosure (unlike exclusive accordion) permits more than one open panel.
      cy.get("[data-cy=filter-collapsible]").should("have.length.at.least", 2);

      cy.get("[data-cy=filter-collapsible]")
        .eq(0)
        .find("h3 button")
        .click()
        .should("have.attr", "aria-expanded", "true");
      cy.get("[data-cy=filter-collapsible]")
        .eq(0)
        .parent()
        .find(".facet-listing")
        .should("be.visible");

      cy.get("[data-cy=filter-collapsible]")
        .eq(1)
        .find("h3 button")
        .click()
        .should("have.attr", "aria-expanded", "true");
      cy.get("[data-cy=filter-collapsible]")
        .eq(0)
        .parent()
        .find(".facet-listing")
        .should("be.visible");
      cy.get("[data-cy=filter-collapsible]")
        .eq(1)
        .parent()
        .find(".facet-listing")
        .should("be.visible");

      cy.get(
        "[data-cy=filter-collapsible] h3 button[aria-expanded='true']"
      ).should("have.length", 2);
    });
  });
});

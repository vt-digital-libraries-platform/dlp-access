/**
 * ARIA Authoring Practices Guide (APG) — Dialog (Modal) Pattern
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *
 * On viewports below the lg breakpoint, the Filters button opens a modal
 * dialog of search facets. This suite checks the APG keyboard interactions
 * and WAI-ARIA roles, states, and properties for that dialog.
 */

function filtersTrigger() {
  return cy.get('.facet-button-navbar button[aria-label="Filters"]');
}

function filtersDialog() {
  return cy.get('.facet-modal-wrapper[role="dialog"]');
}

/**
 * Visible tabbable elements inside the dialog (excludes FocusLock guards).
 * Mirrors the APG definition: elements with tabindex >= 0 that participate
 * in the dialog's tab sequence.
 */
function dialogTabbables() {
  return filtersDialog().then(($dialog) => {
    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])'
    ].join(", ");

    const $tabbables = $dialog
      .find(selector)
      .filter(":visible")
      .not("[data-focus-guard]")
      .not("[data-focus-lock-disabled]");

    return cy.wrap($tabbables);
  });
}

function openFiltersDialog() {
  filtersTrigger().should("be.visible").focus().click();
  filtersDialog().should("be.visible");
}

/** Escape via document keydown — matches SearchFacets' listener (keyCode 27). */
function pressEscape() {
  cy.document().then((doc) => {
    doc.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      })
    );
  });
}

/**
 * Real Tab / Shift+Tab via CDP so the browser moves focus (synthetic
 * KeyboardEvents do not).
 */
function pressTab(shiftKey = false) {
  const modifiers = shiftKey ? 8 : 0;
  const params = {
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    modifiers
  };

  return cy
    .wrap(
      Cypress.automation("remote:debugger:protocol", {
        command: "Input.dispatchKeyEvent",
        params: { type: "keyDown", ...params }
      }),
      { log: false }
    )
    .then(() =>
      Cypress.automation("remote:debugger:protocol", {
        command: "Input.dispatchKeyEvent",
        params: { type: "keyUp", ...params }
      })
    );
}

describe("a11y: APG modal dialog pattern — Filters", () => {
  beforeEach(() => {
    // Filters button is shown and the facet sidebar is hidden below lg (992px).
    cy.viewport(768, 900);
    cy.visit("/search");
    cy.get(".searchbar-wrapper", { timeout: 15000 }).should("exist");
    filtersTrigger().should("be.visible");
    cy.get(".facet-wrapper").should("not.be.visible");
  });

  describe("WAI-ARIA roles, states, and properties", () => {
    it("exposes the facet overlay as a dialog only while open", () => {
      cy.get(".facet-modal-wrapper").should("not.exist");
      cy.get('[role="dialog"]').should("not.exist");

      openFiltersDialog();

      filtersDialog()
        .should("have.attr", "role", "dialog")
        .and("have.class", "facet-modal-wrapper");
    });

    it("sets aria-modal to true on the dialog container", () => {
      openFiltersDialog();
      filtersDialog().should("have.attr", "aria-modal", "true");
    });

    it("gives the dialog an accessible name via aria-labelledby or aria-label", () => {
      openFiltersDialog();
      filtersDialog().then(($dialog) => {
        const labelledBy = $dialog.attr("aria-labelledby");
        const label = $dialog.attr("aria-label");

        expect(
          labelledBy || label,
          "dialog must have aria-labelledby or aria-label"
        ).to.be.ok;

        if (labelledBy) {
          const ids = labelledBy.split(/\s+/);
          ids.forEach((id) => {
            cy.wrap($dialog)
              .find(`#${CSS.escape(id)}`)
              .should("be.visible")
              .invoke("text")
              .then((text) => {
                expect(text.trim(), `accessible name from #${id}`).to.have
                  .length.of.at.least(1);
              });
          });
        } else {
          expect(label.trim(), "aria-label").to.have.length.of.at.least(1);
        }
      });
    });

    it("keeps all dialog operating controls as descendants of role=dialog", () => {
      openFiltersDialog();

      filtersDialog().within(() => {
        cy.contains("button", "Apply Filters").should("exist");
        cy.contains(".sr-only", "Close").should("exist");
        cy.get("[data-cy=filter-collapsibles]").should("exist");
        cy.get("[data-cy=filter-collapsible]").should(
          "have.length.at.least",
          1
        );
      });
    });

    it("includes a visible close control in the dialog tab sequence", () => {
      // APG: strongly recommended that the tab sequence include a visible
      // button that closes the dialog.
      openFiltersDialog();

      filtersDialog()
        .find(".facet-modal-buttons")
        .should("be.visible")
        .within(() => {
          cy.contains(".sr-only", "Close")
            .closest("a, button")
            .should("be.visible")
            .and("not.have.attr", "tabindex", "-1");
        });
    });
  });

  describe("Keyboard interaction", () => {
    it("moves focus into the dialog when it opens", () => {
      filtersTrigger().focus().should("have.focus");
      openFiltersDialog();

      cy.focused()
        .should("exist")
        .closest('[role="dialog"]')
        .should("match", ".facet-modal-wrapper");
    });

    it("closes the dialog on Escape", () => {
      openFiltersDialog();
      pressEscape();

      cy.get(".facet-modal-wrapper").should("not.exist");
      cy.get('[role="dialog"]').should("not.exist");
      cy.get(".facet-wrapper").should("not.be.visible");
    });

    it("returns focus to the Filters trigger when closed with Escape", () => {
      openFiltersDialog();
      cy.focused().closest('[role="dialog"]').should("exist");

      pressEscape();

      cy.get(".facet-modal-wrapper").should("not.exist");
      cy.get('.facet-button-navbar button[aria-label="Filters"]', {
        timeout: 3000
      }).should("have.focus");
    });

    it("returns focus to the Filters trigger when closed with the close control", () => {
      openFiltersDialog();

      filtersDialog()
        .find(".facet-modal-buttons")
        .contains(".sr-only", "Close")
        .closest("a, button")
        .click();

      cy.get(".facet-modal-wrapper").should("not.exist");
      cy.get('.facet-button-navbar button[aria-label="Filters"]', {
        timeout: 3000
      }).should("have.focus");
    });

    it("returns focus to the Filters trigger when closed with Apply Filters", () => {
      openFiltersDialog();

      filtersDialog().contains("button", "Apply Filters").click();

      cy.get(".facet-modal-wrapper").should("not.exist");
      cy.get('.facet-button-navbar button[aria-label="Filters"]', {
        timeout: 3000
      }).should("have.focus");
    });

    it("contains Tab focus within the dialog (focus trap)", () => {
      openFiltersDialog();

      cy.focused().closest('[role="dialog"]').should("exist");

      // Attempting to focus content outside the modal must not stick: the
      // modal's focus trap returns focus to an element inside the dialog.
      cy.get("#content")
        .find("a, button, input, select, [tabindex]")
        .filter(":visible")
        .not('.facet-button-navbar button[aria-label="Filters"]')
        .first()
        .then(($outside) => {
          expect(
            $outside.closest('[role="dialog"]').length,
            "fixture control is outside the dialog"
          ).to.equal(0);
          $outside[0].focus();
        });

      cy.focused()
        .closest('[role="dialog"].facet-modal-wrapper')
        .should("exist");
    });

    it("cycles Tab from the last tabbable element to the first", () => {
      openFiltersDialog();

      dialogTabbables().then(($tabbables) => {
        expect($tabbables.length, "dialog tabbable count").to.be.at.least(2);

        const first = $tabbables.get(0);
        const last = $tabbables.get($tabbables.length - 1);

        last.focus();
        cy.focused().should(($el) => {
          expect($el.get(0)).to.equal(last);
        });

        pressTab(false);

        cy.focused().should(($el) => {
          expect(
            $el.get(0),
            "Tab from last focusable wraps to first"
          ).to.equal(first);
        });
      });
    });

    it("cycles Shift+Tab from the first tabbable element to the last", () => {
      openFiltersDialog();

      dialogTabbables().then(($tabbables) => {
        expect($tabbables.length, "dialog tabbable count").to.be.at.least(2);

        const first = $tabbables.get(0);
        const last = $tabbables.get($tabbables.length - 1);

        first.focus();
        cy.focused().should(($el) => {
          expect($el.get(0)).to.equal(first);
        });

        pressTab(true);

        cy.focused().should(($el) => {
          expect(
            $el.get(0),
            "Shift+Tab from first focusable wraps to last"
          ).to.equal(last);
        });
      });
    });
  });

  describe("Modal behavior", () => {
    it("visually obscures content outside the dialog while open", () => {
      openFiltersDialog();

      filtersDialog()
        .should("be.visible")
        .and("have.css", "position", "fixed")
        .then(($dialog) => {
          const bg = $dialog.css("background-color");
          // rgba overlay (e.g. rgba(0, 0, 0, 0.4)) — not fully transparent.
          expect(bg).to.match(/rgba?\(/);
          const alphaMatch = bg.match(
            /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/
          );
          if (alphaMatch) {
            expect(
              parseFloat(alphaMatch[1]),
              "overlay alpha"
            ).to.be.greaterThan(0);
          }
        });
    });

    it("marks content outside the dialog as inert, with no inert ancestor on the dialog", () => {
      // Not required by the APG itself, but needed so background content is
      // truly non-interactive for voice control, older AT/browser combos,
      // touch, scrolling, and find-in-page. Practically this means the dialog
      // is a direct child of body so siblings can be inerted without inerting
      // the dialog.
      openFiltersDialog();

      filtersDialog().then(($dialog) => {
        const dialog = $dialog[0];
        const doc = dialog.ownerDocument;

        expect(
          dialog.hasAttribute("inert"),
          "dialog itself must not be inert"
        ).to.be.false;

        let ancestor = dialog.parentElement;
        while (ancestor && ancestor !== doc.documentElement) {
          const label =
            ancestor.id ||
            ancestor.className ||
            ancestor.tagName.toLowerCase();
          expect(
            ancestor.hasAttribute("inert"),
            `ancestor "${label}" must not be inert`
          ).to.be.false;
          ancestor = ancestor.parentElement;
        }

        expect(
          dialog.parentElement,
          "dialog should be a direct child of body"
        ).to.equal(doc.body);

        const outside = [...doc.body.children].filter((el) => el !== dialog);
        expect(outside.length, "body siblings outside the dialog").to.be.at
          .least(1);

        outside.forEach((el) => {
          const label = el.id || el.className || el.tagName.toLowerCase();
          expect(
            el.hasAttribute("inert"),
            `body child "${label}" outside the dialog must be inert`
          ).to.be.true;
        });
      });
    });

    it("removes the dialog from the accessibility tree when closed", () => {
      openFiltersDialog();
      filtersDialog().should("exist");

      pressEscape();

      cy.get(".facet-modal-wrapper").should("not.exist");
      cy.get('[role="dialog"]').should("not.exist");
      cy.get('[aria-modal="true"]').should("not.exist");
    });

    it("can be opened again after being closed", () => {
      openFiltersDialog();
      pressEscape();
      cy.get(".facet-modal-wrapper").should("not.exist");

      openFiltersDialog();
      filtersDialog()
        .should("have.attr", "aria-modal", "true")
        .and("be.visible");
      cy.focused().closest('[role="dialog"]').should("exist");
    });
  });
});

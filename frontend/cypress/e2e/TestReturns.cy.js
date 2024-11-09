const roles = ["admin", "staff"];

roles.forEach((role) => {
  describe(`${
    role.charAt(0).toUpperCase() + role.slice(1)
  } Returns Tests`, () => {
    beforeEach(() => {
      cy.visit(`http://localhost:3000/${role}/returns`);
    });

    const searchTerms = ["John", "Supplier", "Completed"];

    describe("Search Bar Tests", () => {
      it("Should display the search bar", () => {
        cy.get('input[placeholder="Search / Filter returns..."]').should(
          "be.visible"
        );
      });

      searchTerms.forEach((term) => {
        it(`Should filter returns based on search input for "${term}"`, () => {
          cy.get('input[placeholder="Search / Filter returns..."]')
            .clear()
            .type(term);

          // Assert that at least one return containing the term is visible
          cy.contains(term).should("exist");
        });
      });
    });

    it("Should open Return Detail modal when View button is clicked", () => {
      cy.get("button").contains("View").first().click();
      cy.get("div").contains("Return Details").should("exist");
    });

    it("Should display total returns", () => {
      cy.get("div").contains("Returns").should("exist");
    });
  });
});

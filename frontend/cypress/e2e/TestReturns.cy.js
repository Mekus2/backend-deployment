const roles = ["staff", "prevstaff"];

roles.forEach((role) => {
  describe(`${
    role.charAt(0).toUpperCase() + role.slice(1)
  } Returns Tests`, () => {
    beforeEach(() => {
      cy.visit(`http://localhost:3000/${role}/issues`);
    });

    const searchTerms = ["John", "Supplier", "Completed"];

    describe("Search Bar Tests", () => {
      it("Should display the search bar", () => {
        cy.get('input[placeholder="Search / Filter issues..."]').should(
          "be.visible"
        );
      });

      searchTerms.forEach((term) => {
        it(`Should filter issues based on search input for "${term}"`, () => {
          cy.get('input[placeholder="Search / Filter issues..."]')
            .clear()
            .type(term);

          // Assert that at least one return containing the term is visible
          cy.contains(term).should("exist");
        });
      });
    });

    it("Should open Return Detail modal when View button is clicked", () => {
      cy.get("button").contains("View").first().click();
      cy.get("div").contains("Issue Details").should("exist");
    });

    it("Should display total issues", () => {
      cy.get("div").contains("Returns").should("exist");
    });
  });
});

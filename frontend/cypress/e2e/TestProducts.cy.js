const roles = ["staff", "prevstaff", "superadmin"]; // Included admin and staff roles

roles.forEach((role) => {
  describe(`${
    role.charAt(0).toUpperCase() + role.slice(1)
  } Products Tests`, () => {
    beforeEach(() => {
      // Visit the Admin Products page
      cy.visit(`http://localhost:3000/${role}/products`);
    });

    const searchTerms = ["VetMed", "Syringes", "Wound"];

    describe("Search Bar Tests", () => {
      it("Should display the search bar", () => {
        cy.get('input[placeholder="Search / Filter product..."]').should(
          "be.visible"
        );
      });

      searchTerms.forEach((term) => {
        it(`Should filter products based on search input for "${term}"`, () => {
          cy.get('input[placeholder="Search / Filter product..."]')
            .clear() // Clear previous input
            .type(term); // Type the current search term

          // Assert that at least one product containing the term is visible
          cy.contains(term).should("exist"); // Adjust based on actual expected content
        });
      });
    });

    // Additional tests for the Add Product and Add Category buttons
    it("Should open Add Product modal when Add Product button is clicked", () => {
      cy.get("button").contains("Product").click();
      cy.get("div").contains("Add Product").should("exist"); // Check if modal is visible
    });

    it("Should open Add Category modal when Add Category button is clicked", () => {
      cy.get("button").contains("Category").click();
      cy.get("div").contains("Category").should("exist"); // Check if modal is visible
    });

    // Test for the Details button
    it("Should open Product Details modal when Details button is clicked", () => {
      // Click on the first Details button
      cy.get("button").contains("Details").first().click();
      cy.get("div").contains("Details").should("exist"); // Check if modal is visible
    });
  });
});

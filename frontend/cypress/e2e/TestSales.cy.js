describe("Admin Sales Tests", () => {
  beforeEach(() => {
    // Visit the Admin Sales page
    cy.visit("http://localhost:3000/admin/sales");
  });

  const searchTerms = ["INV001", "C001", "Courier"];

  describe("Search Bar Tests", () => {
    it("Should display the search bar", () => {
      cy.get('input[placeholder="Search / Filter sales..."]').should(
        "be.visible"
      );
    });

    searchTerms.forEach((term) => {
      it(`Should filter sales based on search input for "${term}"`, () => {
        cy.get('input[placeholder="Search / Filter sales..."]')
          .clear() // Clear previous input
          .type(term); // Type the current search term

        // Assert that at least one sale containing the term is visible
        cy.contains(term).should("exist"); // Adjust based on actual expected content
      });
    });
  });

  // Additional tests for the Sales Details button
  it("Should open Sales Details modal when Details button is clicked", () => {
    // Click on the first Details button
    cy.get("button").contains("Details").first().click();
    cy.get("div").contains("Details").should("exist"); // Check if modal is visible
  });

  // Test to ensure the totals are displayed correctly
  it("Should display total sales and transactions", () => {
    cy.get("div").contains("Total This Month").should("exist");
    cy.get("div").contains("Transactions").should("exist");
  });
});

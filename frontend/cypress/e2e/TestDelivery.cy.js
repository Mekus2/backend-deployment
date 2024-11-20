const roles = ["admin", "staff", "superadmin"];

roles.forEach((role) => {
  describe(`${
    role.charAt(0).toUpperCase() + role.slice(1)
  } Delivery SearchBar and Buttons Tests`, () => {
    beforeEach(() => {
      // Visit the respective delivery page
      cy.visit(`http://localhost:3000/${role}/delivery`);
    });

    const searchTerms = [
      "Completed",
      "Pending",
      "Cancelled",
      "Sales",
      "Supplier",
    ];

    searchTerms.forEach((term) => {
      it(`Should filter delivery based on search input for "${term}"`, () => {
        // Check if SearchBar is present and visible
        cy.get('input[placeholder="Search / Filter delivery..."]')
          .should("be.visible")
          .clear() // Clear previous input
          .type(term); // Type the current search term

        // Assert that filtered results are shown
        cy.contains(term).should("exist");
      });
    });

    // Additional test for the Details button
    it("Should open Delivery Details modal when Details button is clicked", () => {
      // Click on the first Details button
      cy.get("button").contains("Details").click();
      cy.get("div").contains("Delivery Details").should("exist"); // Adjust this to check the modal visibility
    });
  });
});

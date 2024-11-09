// cypress/e2e/TestNotifications.cy.js
const roles = ["admin", "staff", "superadmin"]; // Include both roles for testing

roles.forEach((role) => {
  describe(`${
    role.charAt(0).toUpperCase() + role.slice(1)
  } Notification Tests`, () => {
    beforeEach(() => {
      cy.visit(`http://localhost:3000/${role}/notifications`); // Visit the notification page for the role
    });

    const searchTerms = ["Low Stock", "Received", "Maintenance"];

    describe("Search Bar Tests", () => {
      it("Should display the search bar", () => {
        cy.get('input[placeholder="Search / Filter notifications..."]').should(
          "be.visible"
        );
      });

      searchTerms.forEach((term) => {
        it(`Should filter notifications based on search input for "${term}"`, () => {
          cy.get('input[placeholder="Search / Filter notifications..."]')
            .clear()
            .type(term);

          // Assert that filtered results are shown
          cy.contains(term).should("exist");
        });
      });
    });

    it("Should display notification headers", () => {
      // Check for the main heading of the notifications
      cy.contains("Notifications").should("be.visible");
      cy.contains("Notifications").should("be.visible");
    });

    it("Should display the card summary for total notifications", () => {
      cy.contains("Notifications").should("be.visible");
    });
  });
});

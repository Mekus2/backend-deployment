const roles = ["admin", "staff", "superadmin"]; // Included superadmin

roles.forEach((role) => {
  describe(`${
    role.charAt(0).toUpperCase() + role.slice(1)
  } Dashboard Tests`, () => {
    beforeEach(() => {
      cy.visit(`http://localhost:3000/${role}/dashboard`);
    });

    const commonTests = () => {
      it("Should display the Lowest Stocks table", () => {
        cy.contains("Lowest Stocks").scrollIntoView().should("be.visible");
      });
      it("Should display the Expired Items Alert table", () => {
        cy.contains("Expired Items Alert")
          .scrollIntoView()
          .should("be.visible");
      });
      it("Should display the Products card", () => {
        cy.contains("Products").scrollIntoView().should("be.visible");
      });
    };

    if (role === "admin" || role === "superadmin") {
      // Tests for both admin and superadmin roles
      it("Should display the Highest Selling Products table", () => {
        cy.contains("Highest Selling Products")
          .scrollIntoView()
          .should("be.visible");
      });
      it("Should display the Recently Added Products table", () => {
        cy.contains("Recently Added Products")
          .scrollIntoView()
          .should("be.visible");
      });

      commonTests(); // Include common tests for Recently Added Products, Lowest Stocks, and Products

      if (role === "superadmin") {
        it("Should display the Customers card", () => {
          cy.contains("Customers").scrollIntoView().should("be.visible");
        });
      }
    }

    if (role === "staff") {
      // Staff-specific tests
      commonTests(); // Include common tests for Recently Added Products, Lowest Stocks, and Products

      it("Should not display the Sales card", () => {
        cy.contains("Sales").should("not.exist");
      });
    }
  });
});

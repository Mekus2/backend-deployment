const roles = ["admin", "staff", "superadmin"]; // Add superadmin role

roles.forEach((role) => {
  describe(`${
    role.charAt(0).toUpperCase() + role.slice(1)
  } Orders Tests`, () => {
    beforeEach(() => {
      cy.visit(`http://localhost:3000/${role}/orders/customer-order`);
    });

    const searchTerms = ["Paid", "Pending", "Overdue"];

    describe("Search Bar Tests", () => {
      it("Should display the search bar", () => {
        cy.get('input[placeholder="Search / Filter customer..."]').should(
          "be.visible"
        );
      });

      searchTerms.forEach((term) => {
        it(`Should filter customer orders based on search input for "${term}"`, () => {
          cy.get('input[placeholder="Search / Filter customer..."]')
            .clear()
            .type(term);

          // Assert that filtered results are shown
          cy.contains(term).should("exist");
        });
      });
    });

    // Test for the Add Customer Order button
    it("Should open Add Customer Order modal when Add Customer Order button is clicked", () => {
      cy.get("button").contains("Customer Order").click();
      cy.get("div").contains("Customer Order").should("exist");
    });

    // Test for the Details button
    it("Should open Order Details modal when Details button is clicked", () => {
      cy.get("button").contains("Details").first().click();
      cy.get("div").contains("Order Details").should("exist");
    });

    // General stats tests for all roles
    describe(`${role} Stats Card Tests`, () => {
      if (role === "staff") {
        it("Should display stats cards for staff", () => {
          cy.get("div").contains("Low Stocks").should("be.visible");
          cy.get("div").contains("Customers").should("be.visible");
          cy.get("div").contains("Deliveries").should("be.visible");
          cy.get("div").contains("Total Orders").should("be.visible");
          cy.get("div").contains("Products").should("be.visible");
          cy.get("div").contains("Returns").should("be.visible");
          cy.get("div").contains("Notifications").should("be.visible");
        });
      } else {
        it("Should display stats cards for admin and superadmin", () => {
          cy.get("div").contains("Low Stocks").should("be.visible");
          cy.get("div").contains("Customers").should("be.visible");
          cy.get("div").contains("Deliveries").should("be.visible");
          cy.get("div").contains("Logs").should("be.visible");
          cy.get("div").contains("Total Orders").should("be.visible");
          cy.get("div").contains("Products").should("be.visible");
          cy.get("div").contains("Returns").should("be.visible");
          cy.get("div").contains("Total This Month").should("be.visible");
          cy.get("div").contains("Users").should("be.visible");
          cy.get("div").contains("Suppliers").should("be.visible");
          cy.get("div").contains("Notifications").should("be.visible");
        });
      }
    });

    // Navigation tests for all roles
    it("Should navigate to Low Stocks page when Low Stocks card is clicked", () => {
      cy.get("div").contains("Low Stocks").click();
      cy.url().should("include", `/${role}/inventory`);
    });

    it("Should navigate to Customers page when Customers card is clicked", () => {
      cy.get("div").contains("Customers").click();
      cy.url().should("include", `/${role}/customers`);
    });

    it("Should navigate to Delivery page when Deliveries card is clicked", () => {
      cy.get("div").contains("Deliveries").click();
      cy.url().should("include", `/${role}/delivery`);
    });

    it("Should navigate to Orders page when Total Orders card is clicked", () => {
      cy.get("div").contains("Total Orders").click();
      cy.url().should("include", `/${role}/orders`);
    });

    it("Should navigate to Products page when Products card is clicked", () => {
      cy.get("div").contains("Products").click();
      cy.url().should("include", `/${role}/products`);
    });

    it("Should navigate to Returns page when Returns card is clicked", () => {
      cy.get("div").contains("Returns").click();
      cy.url().should("include", `/${role}/returns`);
    });

    // Revenue and expense stats specific to admin
    if (role === "admin" || role === "superadmin") {
      it("Should display revenue and expense stats correctly", () => {
        cy.get("p").contains("₱ 107,000").should("be.visible");
        cy.get("p").contains("₱ 620,000").should("be.visible");
        cy.get("p").contains("₱ 50,000").should("be.visible");
      });

      it("Should display graphs", () => {
        cy.get("div").contains("Revenue Graph").should("exist");
        cy.get("div").contains("Cost Breakdown").should("exist");
      });
    }
  });
});

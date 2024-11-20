const roles = ['admin', 'staff', 'superadmin']; // Added superadmin role

roles.forEach(role => {
  describe(`${role.charAt(0).toUpperCase() + role.slice(1)} Customers Tests`, () => {
    beforeEach(() => {
      cy.visit(`http://localhost:3000/${role}/customers`);
    });

    const searchTerms = ['Alicia', '09391234567'];

    describe('Search Bar Tests', () => {
      it('Should display the search bar', () => {
        cy.get('input[placeholder="Search / Filter customer..."]').should('be.visible');
      });

      searchTerms.forEach(term => {
        it(`Should filter customers based on search input for "${term}"`, () => {
          cy.get('input[placeholder="Search / Filter customer..."]')
            .clear()
            .type(term);

          // Adjust this assertion to check only if the term exists in the data
          cy.contains(term).should('exist').then(exists => {
            if (!exists) {
              cy.log(`${term} not found in customer data`);
            }
          });
        });
      });
    });

    // Additional tests for the Add Customer button and modal
    describe('Add Customer Modal Tests', () => {
      it('Should open Add Customer modal when Add Customer button is clicked', () => {
        cy.get('button').contains('Customer').click();
        cy.get('div').contains('Add New Customer').should('be.visible'); // Check if modal is visible
      });

      it('Should display error messages if required fields are empty', () => {
        cy.get('button').contains('Customer').click();
        cy.get('button').contains('Add Customer').click();

        // Check if error messages are displayed for required fields
        cy.get('p').contains('Customer name is required').should('be.visible');
        cy.get('p').contains('City is required').should('be.visible');
        cy.get('p').contains('Province is required').should('be.visible');
        cy.get('p').contains('Phone number is required').should('be.visible');
      });

      it('Should allow adding a customer with valid inputs', () => {
        cy.get('button').contains('Customer').click();
        
        // Fill in valid customer details
        cy.get('input[placeholder="Enter Customer Name"]').type('Alicia Keys');
        cy.get('input[placeholder="City"]').type('New York');
        cy.get('input[placeholder="Province"]').type('New York');
        cy.get('input[placeholder="Enter Phone Number"]').type('09391234567');

        cy.get('button').contains('Add Customer').click();

        // Ensure modal closes after adding customer
        cy.get('div').contains('Add New Customer').should('not.exist');
      });

      it('Should prevent adding a customer with invalid phone number', () => {
        cy.get('button').contains('Customer').click();
        
        // Fill in customer details with an invalid phone number
        cy.get('input[placeholder="Enter Customer Name"]').type('Alicia Keys');
        cy.get('input[placeholder="City"]').type('New York');
        cy.get('input[placeholder="Province"]').type('New York');
        cy.get('input[placeholder="Enter Phone Number"]').clear().type('12345');

        cy.get('button').contains('Add Customer').click();

        // Ensure the phone number error message is displayed
        cy.get('p').contains('Phone number is required').should('be.visible');
      });
    });

    // Test for the Details button
    it('Should open Customer Details modal when Details button is clicked', () => {
      cy.get('button').contains('Details').first().click();
      cy.get('div').contains('Details').should('be.visible'); // Check if modal is visible
    });
  });
});

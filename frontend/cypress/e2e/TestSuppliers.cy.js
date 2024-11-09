describe('Admin Suppliers Tests', () => {
  beforeEach(() => {
    // Visit the Admin Suppliers page
    cy.visit('http://localhost:3000/admin/suppliers');
  });

  const searchTerms = ['Pet', 'Jane', '09123456789'];

  describe('Search Bar Tests', () => {
    it('Should display the search bar', () => {
      cy.get('input[placeholder="Search / Filter supplier..."]')
        .should('be.visible');
    });

    searchTerms.forEach((term) => {
      it(`Should filter suppliers based on search input for "${term}"`, () => {
        cy.get('input[placeholder="Search / Filter supplier..."]')
          .clear() // Clear previous input
          .type(term); // Type the current search term

        // Assert that at least one supplier containing the term is visible
        cy.contains(term)
          .should('exist'); // Adjust based on actual expected content
      });
    });
  });

  // Additional tests for the Add Supplier button
  it('Should open Add Supplier modal when Add Supplier button is clicked', () => {
    cy.get('button').contains('Supplier').click();
    cy.get('div').contains('Supplier').should('exist'); // Check if modal is visible
  });

  // Test for the Details button
  it('Should open Supplier Details modal when Details button is clicked', () => {
    // Click on the first Details button
    cy.get('button').contains('Details').first().click();
    cy.get('div').contains('Details').should('exist'); // Check if modal is visible
  });
});

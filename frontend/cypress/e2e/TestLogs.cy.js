describe('Admin Logs Tests', () => {
  beforeEach(() => {
    // Visit the Admin Logs page
    cy.visit('http://localhost:3000/admin/logs');
  });

  const searchTerms = ['Product', '15', 'Added'];

  describe('Search Bar Tests', () => {
    it('Should display the search bar', () => {
      cy.get('input[placeholder="Search / Filter logs..."]')
        .should('be.visible');
    });

    searchTerms.forEach((term) => {
      it(`Should filter logs based on search input for "${term}"`, () => {
        cy.get('input[placeholder="Search / Filter logs..."]')
          .clear() // Clear previous input
          .type(term); // Type the current search term

        // Assert that at least one log containing the term is visible
        cy.contains(term).should('exist'); // Adjust based on actual expected content
      });
    });
  });

  it('Should display log entries correctly', () => {
    cy.get('table').should('exist'); // Ensure the table is present
    cy.get('tr').should('have.length.greaterThan', 0); // Ensure there are log entries
  });
});

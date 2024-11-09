const roles = ['admin', 'staff', 'superadmin'];

roles.forEach(role => {
  describe(`${role.charAt(0).toUpperCase() + role.slice(1)} Inventory Tests`, () => {
    beforeEach(() => {
      cy.visit(`http://localhost:3000/${role}/inventory`);
    });

    const searchTerms = ['In stock', 'Low stock', 'Out of stock'];

    describe('Search Bar Tests', () => {
      it('Should display the search bar', () => {
        cy.get('input[placeholder="Search / Filter inventory..."]').should('be.visible');
      });

      searchTerms.forEach(term => {
        it(`Should filter inventory based on search input for "${term}"`, () => {
          cy.get('input[placeholder="Search / Filter inventory..."]')
            .clear()
            .type(term);

          // Assert that filtered results are shown
          cy.contains(term).should('exist');
        });
      });
    });

    it('Should open Inventory Details modal when Details button is clicked', () => {
      cy.get('button').contains('Details').first().click();
      cy.get('div').contains('Details').should('exist');
    });
  });
});

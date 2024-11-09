describe("Profile Page Visibility Tests", () => {
  const profiles = [
    { role: "admin", imgAlt: "Admin Profile" },
    { role: "staff", imgAlt: "Staff Profile" },
    { role: "superadmin", imgAlt: "Superadmin Profile" }, // Added superadmin
  ]; // Define profile roles and image alt text for each role

  profiles.forEach(({ role, imgAlt }) => {
    describe(`${
      role.charAt(0).toUpperCase() + role.slice(1)
    } Profile Tests`, () => {
      beforeEach(() => {
        // Visit the profile page for each role
        cy.visit(`http://localhost:3000/${role}/profile`);
      });

      it(`Should display the name field for ${role}`, () => {
        // Check that the name field is displayed
        cy.contains("Name").should("be.visible");
      });

      it(`Should display the email field for ${role}`, () => {
        // Check that the email field is displayed
        cy.contains("Email").should("be.visible");
      });

      it(`Should display the contact field for ${role}`, () => {
        // Check that the contact field is displayed
        cy.contains("Contact").should("be.visible");
      });

      it(`Should display the password field for ${role}`, () => {
        // Check that the password field is displayed
        cy.contains("Password").should("be.visible");
      });
    });
  });
});

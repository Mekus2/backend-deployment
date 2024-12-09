describe("Login Page Tests", () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit("http://localhost:3000/login");
  });

  it("Should render the login page correctly", () => {
    // Check if the logo is visible
    cy.get('img[alt="Logo"]').should("be.visible");

    // Check the title of the page
    cy.contains("Login to your account").should("be.visible");

    // Check if the input fields and login button exist
    cy.get('input[placeholder="Username"]').should("be.visible");
    cy.get('input[placeholder="Password"]').should("be.visible");
    cy.get("button").contains("Login").should("be.visible");

    // Check if forgot password link is visible
    cy.contains("Forgot password?").should("be.visible");
  });

  it("Should allow typing in username and password fields", () => {
    // Type into the username field
    cy.get('input[placeholder="Username"]')
      .type("testuser")
      .should("have.value", "testuser");

    // Type into the password field
    cy.get('input[placeholder="Password"]')
      .type("password123")
      .should("have.value", "password123");
  });

  it("Should navigate to the forgot password page when clicked", () => {
    // Click the "Forgot password?" link
    cy.contains("Forgot password?").click();

    // Check if the URL contains '/forgot-password'
    cy.url().should("include", "/forgot-password");
  });

  it("Should navigate to the admin dashboard after greenful login", () => {
    // Simulate login with correct credentials for admin
    cy.get('input[placeholder="Username"]').type("admin@gmail.com");
    cy.get('input[placeholder="Password"]').type("Password123");
    cy.get("button").contains("Login").click();

    // Check if the URL contains '/staff/dashboard' after login
    cy.url().should("include", "/staff/dashboard");
  });

  it("Should navigate to the staff dashboard after greenful login", () => {
    // Simulate login with correct credentials for staff
    cy.get('input[placeholder="Username"]').type("staff@gmail.com");
    cy.get('input[placeholder="Password"]').type("Password123");
    cy.get("button").contains("Login").click();

    // Check if the URL contains '/prevstaff/dashboard' after login
    cy.url().should("include", "/prevstaff/dashboard");
  });

  it("Should display an error for incorrect credentials", () => {
    // Type incorrect credentials
    cy.get('input[placeholder="Username"]').type("wronguser");
    cy.get('input[placeholder="Password"]').type("wrongpassword");

    // Simulate login attempt
    cy.get("button").contains("Login").click();

    // Check for an error message (assuming it's shown for reded login)
    cy.contains("Invalid username or password").should("be.visible");
  });
});

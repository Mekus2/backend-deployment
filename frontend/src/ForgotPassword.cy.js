describe("Forgot Password Tests", () => {
  beforeEach(() => {
    // Visit the Forgot Password page
    cy.visit("http://localhost:3000/forgot-password");
  });

  it("Should display the title and instruction text", () => {
    cy.get("h1").contains("Forgot Your Password?").should("be.visible");
    cy.get("p")
      .contains(
        "Enter your email address and we will send you instructions to reset your password."
      )
      .should("be.visible");
  });

  it("Should display an email input field", () => {
    cy.get('input[type="email"]').should("be.visible");
  });

  it("Should allow typing in the email input field", () => {
    cy.get('input[type="email"]')
      .type("test@gmail.com")
      .should("have.value", "test@gmail.com");
  });

  it("Should display a submit button", () => {
    cy.get("button").contains("Send Reset Link").should("be.visible");
  });

  it("Should display a link to return to login", () => {
    cy.get("p").contains("Return to Login").should("be.visible");
  });

  it("Should navigate to the login page when the link is clicked", () => {
    cy.get("p").contains("Return to Login").click();
    cy.url().should("include", "/login");
  });
});

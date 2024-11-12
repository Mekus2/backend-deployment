import axios from "axios";

// Specific endpoints for each action in the Forgot Password process
const OTP_URL = "http://127.0.0.1:8000/forgot/otp/";
const VERIFY_OTP_URL = "http://127.0.0.1:8000/forgot/verifyotp/";
const CHANGE_PASSWORD_URL = "http://127.0.0.1:8000/forgot/changepassword/";
const RESEND_OTP_URL = "http://127.0.0.1:8000/forgot/resend-otp/";

// Function to send the OTP email
export const sendOtp = async (email) => {
  try {
    const response = await axios.post(OTP_URL, { email });

    // Store the email in local storage
    localStorage.setItem("forgotPasswordEmail", email);

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to send OTP";
  }
};

// Function to verify the OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(VERIFY_OTP_URL, { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to verify OTP";
  }
};

// Function to reset the password
export const resetPassword = async (otp, newPassword) => {
  // Retrieve the email from local storage
  const email = localStorage.getItem("forgotPasswordEmail");

  if (!email) {
    throw new Error("Email not found. Please request a new OTP.");
  }

  try {
    const response = await axios.post(CHANGE_PASSWORD_URL, {
      email, // Send the email to the backend
      otp,
      new_password: newPassword,
    });

    // Optionally clear the stored email after successful password change
    localStorage.removeItem("forgotPasswordEmail");

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to reset password";
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await axios.post(RESEND_OTP_URL, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to resend OTP";
  }
};
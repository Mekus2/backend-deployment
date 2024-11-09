import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import logo from "../assets/roundlogo.png";
import loginbg from "../assets/loginbg.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const notifySuccess = (message) => {
    toast.success(message);
  };

  const handleSendResetLink = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return; // Return early for validation errors
    }

    console.log(`Reset link sent to: ${email}`);
    setError("");
    setOtpSent(true);
    notifySuccess("Reset link sent! Check your email."); // Success notification
  };

  const handleVerifyOtp = () => {
    // Skip OTP validation and directly proceed to enter new password
    setOtpVerified(true);
    setError("");
    notifySuccess("OTP verified! You can now set a new password."); // Success notification
  };

  const handleResetPassword = () => {
    if (newPassword === "" || confirmPassword === "") {
      setError("Both fields are required.");
      return; // Return early for validation errors
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return; // Return early for validation errors
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return; // Return early for validation errors
    }

    // Simulate password reset logic
    console.log(`Password has been reset to: ${newPassword}`);
    setError("");
    setPasswordResetSuccess(true);
    notifySuccess("Password has been reset successfully!"); // Success notification
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setEmail("");
    setOtp("");
    notifySuccess("OTP has been resent. Please check your email."); // Success notification
  };

  return (
    <BackgroundContainer>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <FormContainer>
        <LogoContainer>
          <Logo src={logo} alt="Logo" />
        </LogoContainer>
        <Title>
          {passwordResetSuccess ? "Password Reset Successful" : otpVerified ? "Reset Your Password" : otpSent ? "Enter Your OTP" : "Forgot Your Password?"}
        </Title>
        <InstructionText>
          {passwordResetSuccess
            ? "You can now log in using your new password."
            : otpVerified
            ? "Enter your new password."
            : otpSent
            ? "Enter the OTP sent to your email address."
            : "Enter your email address and we will send you instructions to reset your password."}
        </InstructionText>
        {error && <ErrorText>{error}</ErrorText>}
        {!passwordResetSuccess ? (
          <>
            {!otpVerified ? (
              <>
                {!otpSent ? (
                  <>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <SubmitButton onClick={handleSendResetLink}>
                      Send Reset Link
                    </SubmitButton>
                  </>
                ) : (
                  <>
                    <Input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <SubmitButton onClick={handleVerifyOtp}>
                      Verify OTP
                    </SubmitButton>
                    <ResendOtpButton onClick={handleResendOtp}>
                      Resend OTP
                    </ResendOtpButton>
                  </>
                )}
              </>
            ) : (
              <>
                <PasswordContainer>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <TogglePasswordVisibility onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </TogglePasswordVisibility>
                </PasswordContainer>
                <PasswordContainer>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <TogglePasswordVisibility onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </TogglePasswordVisibility>
                </PasswordContainer>
                <SubmitButton onClick={handleResetPassword}>
                  Reset Password
                </SubmitButton>
              </>
            )}
          </>
        ) : (
          <Link to="/login">
            <BackToLoginLink>Go to Login</BackToLoginLink>
          </Link>
        )}
      </FormContainer>
    </BackgroundContainer>
  );
};

// Styled components for styling
const BackgroundContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url(${loginbg}) no-repeat center center/cover;
  padding: 20px;
`;

const FormContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(128, 206, 219, 0.8);
  padding: 30px;
  border-radius: 15px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    padding: 40px;
    max-width: 450px;
  }
`;

const LogoContainer = styled.div`
  position: absolute;
  top: -60px;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const Logo = styled.img`
  width: 140px;

  @media (min-width: 768px) {
    width: 150px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin: 70px 0 20px 0;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 28px;
  }
`;

const InstructionText = styled.p`
  font-size: 16px;
  text-align: center;
  color: #333;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const ErrorText = styled.p`
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 2px solid #000;
  border-radius: 10px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #007B83;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #ef893e;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: #d77834;
  }
`;

const ResendOtpButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007B83;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  margin-top: 10px;

  &:hover {
    background-color: #005f68;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const TogglePasswordVisibility = styled.button`
  position: absolute;
  right: 12px;
  top: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: gray;
  font-size: 18px;

  &:hover {
    color: darkgray;
  }
`;

const BackToLoginLink = styled.p`
  margin-top: 20px;
  font-size: 14px;
  color: gray;
  text-align: center;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export default ForgotPassword;

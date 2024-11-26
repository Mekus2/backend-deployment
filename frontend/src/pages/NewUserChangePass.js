import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import logo from "../assets/roundlogo.png";
import loginbg from "../assets/loginbg.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const NewUserChangePass = ({ userId }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const navigate = useNavigate();

  const notifySuccess = (message) => {
    toast.success(message);
  };

  const handleChangePassword = async () => {
    const userId = localStorage.getItem("user_id");
    // Regex for validating a strong password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
    if (!newPassword || !confirmPassword) {
      setError("Both fields are required.");
      return;
    }
  
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your passwords.");
      return;
    }
  
    try {
      // Make the API call to change the password
      const token = localStorage.getItem("auth_token");  // Get JWT token from local storage

      const response = await axios.put(
        `http://127.0.0.1:8000/account/users/changepass/${userId}/`,
        {
          new_password: newPassword,  // New password to update
          confirm_password: confirmPassword,  // Confirm password to check match
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Pass the JWT token for authentication
          },
        }
      );

      setPasswordChanged(true);
      notifySuccess("Your password has been successfully changed!");
      setTimeout(() => {
        navigate("/login");  // Redirect to login page after successful change
      }, 2000);
    } catch (error) {
      setError("An error occurred while changing your password.");
    }
  };

  return (
    <BackgroundContainer>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <FormContainer>
        <LogoContainer>
          <Logo src={logo} alt="Logo" />
        </LogoContainer>
        <Title>Change Your Password</Title>
        <InstructionText>
          Please set a new password. Choose a strong password and keep it in a safe place.
        </InstructionText>
        {error && <ErrorText>{error}</ErrorText>}
        {passwordChanged ? (
          <Link to="/login">
            <BackToLoginLink>Go to Login</BackToLoginLink>
          </Link>
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
                {showPassword ? <FaEye /> : <FaEyeSlash />}
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
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </TogglePasswordVisibility>
            </PasswordContainer>
            <SubmitButton onClick={handleChangePassword}>Change Password</SubmitButton>
          </>
        )}
      </FormContainer>
    </BackgroundContainer>
  );
};

// Styled components
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
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin: 70px 0 20px 0;
  text-align: center;
`;

const InstructionText = styled.p`
  font-size: 16px;
  text-align: center;
  color: #333;
  margin-bottom: 20px;
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
    border-color: #007b83;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const TogglePasswordVisibility = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-100%);
  cursor: pointer;
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

const BackToLoginLink = styled.div`
  margin-top: 20px;
  color: #007b83;
  cursor: pointer;
`;

export default NewUserChangePass;

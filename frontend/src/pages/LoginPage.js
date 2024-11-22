import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import styled from 'styled-components';
import { useUserRole } from '../context/UserContext'; // Import useUserRole to set the role
import { loginUser } from '../api/LoginApi'; // Import the loginUser function
import logo from '../assets/roundlogo.png';
import loginbg from '../assets/loginbg.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { setRole } = useUserRole(); // Access setRole from context
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error state
    setIsLoading(true); // Set loading to true

    try {
      const credentials = { username, password };
      const data = await loginUser(credentials); // Call the login API

      // Check if the password is the default password
      if (password === "Password@123") {
        // If the password is the default one, redirect to the change password page
        navigate('/change-password'); // Redirect to the change password page
      } else {
        // If the password is not the default, continue with normal login flow
        setRole(data.type); // Set role based on API response
        navigate(`/${data.type}/dashboard`); // Redirect based on role using navigate
      }
    } catch (err) {
      // Handle error responses
      setError(err.detail || 'Login failed'); // Display detailed error message from the response
      console.error('Login failed:', err); // Log the error for debugging
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <BackgroundContainer>
      <FormContainer>
        <LogoContainer>
          <Logo src={logo} alt="Logo" />
        </LogoContainer>
        <Title>Login to your account</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleLogin}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link to="/forgot-password">
            <ForgotPasswordText>Forgot password?</ForgotPasswordText>
          </Link>
          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login'}
          </LoginButton>
        </form>
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

const ForgotPasswordText = styled.p`
  font-size: 14px;
  color: gray;
  margin-bottom: 20px;
  text-align: center;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const LoginButton = styled.button`
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

  &:disabled {
    background-color: #d77834;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-bottom: 15px;
`;

export default LoginPage;

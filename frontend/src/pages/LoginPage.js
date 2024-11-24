import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import styled from 'styled-components';
import { useUserRole } from '../context/UserContext'; 
import { loginUser } from '../api/LoginApi'; 
import logo from '../assets/roundlogo.png';
import loginbg from '../assets/loginbg.png';

// Import icons from react-icons
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const { setRole } = useUserRole(); 
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); 

    try {
      const credentials = { username, password };
      const data = await loginUser(credentials); 

      if (password === "Password@1233") {
        navigate('/change-password'); 
      } else {
        setRole(data.type); 
        navigate(`/${data.type}/dashboard`); 
      }
    } catch (err) {
      setError(err.detail || 'Login failed');
      console.error('Login failed:', err); 
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent form submission when toggling password visibility
  const handlePasswordToggle = (e) => {
    e.preventDefault(); // Prevent form submission when clicking the toggle button
    setShowPassword(!showPassword);
  };

  return (
    <BackgroundContainer>
      <FormContainer>
        <LogoContainer>
          <Logo src={logo} alt="Logo" />
        </LogoContainer>
        <Title>Login to your account</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleLogin}>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <PasswordContainer>
            <Input
              type={showPassword ? "text" : "password"}  // Toggle password visibility
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordToggleButton onClick={handlePasswordToggle}>
              {showPassword ? <FaEye /> : <FaEyeSlash />}  {/* Use FaEye and FaEyeSlash */}
            </PasswordToggleButton>
          </PasswordContainer>
          <Link to="/forgot-password">
            <ForgotPasswordText>Forgot password?</ForgotPasswordText>
          </Link>
          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login'}
          </LoginButton>
        </Form>
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
  max-width: 500px;  /* Adjust max width */
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
  width: 100%;  /* Ensures the input takes up full width inside the form */
  padding: 14px;  
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
    font-size: 16px;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
  top: 40%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
`;

const ForgotPasswordText = styled.p`
  font-size: 14px;
  color: gray;
  margin-bottom: 20px;
  text-align: center;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
    color: darkgray;
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

const Form = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 20px;
`;

const ErrorMessage = styled.p`
  color: red;
`;

export default LoginPage;

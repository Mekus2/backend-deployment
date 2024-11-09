// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useUserRole } from '../context/UserContext'; // Import useUserRole to set the role
import logo from '../assets/roundlogo.png';
import loginbg from '../assets/loginbg.jpg';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setRole } = useUserRole(); // Access setRole from context

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'admin@gmail.com' && password === 'Password123') {
      setRole('admin');
      window.location.href = '/admin/dashboard';
    } else if (username === 'superadmin@gmail.com' && password === 'Password123') {
      setRole('superadmin');
      window.location.href = '/superadmin/dashboard';
    } else if (username === 'staff@gmail.com' && password === 'Password123') {
      setRole('staff');
      window.location.href = '/staff/dashboard';
    } else {
      setError('Invalid username or password');
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
          <LoginButton type="submit">Login</LoginButton>
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
  background-color: #EF893E;
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

const ErrorMessage = styled.p`
  color: red;
  margin-bottom: 15px;
`;

export default LoginPage;

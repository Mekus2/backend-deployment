// src/context/UserProvider.js
import React from 'react';
import { UserProvider } from './UserContext';

const AppWrapper = ({ children }) => {
  return <UserProvider>{children}</UserProvider>;
};

export default AppWrapper;

// src/context/UserContext.js
import React, { createContext, useContext, useState } from 'react';

// Create UserContext
const UserContext = createContext();

// Custom hook to access the UserRole context
export const useUserRole = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserRole must be used within a UserProvider');
  }
  return context;
};

// UserProvider component to wrap around the app and provide user role context
export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  const value = {
    role,
    setRole,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

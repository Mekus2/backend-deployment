// src/pages/SuperAdminUsers.js

import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedUsersPage from "../../components/Users/SharedUsersPage"; // Ensure the path is correct

const SuperAdminUsers = () => {
  return (
    <MainLayout>
      <SharedUsersPage userType="superadmin" /> {/* Pass userType to differentiate */}
    </MainLayout>
  );
};

export default SuperAdminUsers;

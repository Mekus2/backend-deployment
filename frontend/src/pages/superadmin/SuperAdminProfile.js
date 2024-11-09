// SuperAdminProfile.js
import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedProfilePage from "../../components/Profile/SharedProfilePage";

const SuperAdminProfile = () => {
  return (
    <MainLayout>
      <SharedProfilePage userRole="SuperAdmin" />
    </MainLayout>
  );
};

export default SuperAdminProfile;

// AdminProfile.js
import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedProfilePage from "../../components/Profile/SharedProfilePage";

const AdminProfile = () => {
  return (
    <MainLayout>
      <SharedProfilePage userRole="Admin" />
    </MainLayout>
  );
};

export default AdminProfile;

// StaffProfile.js
import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedProfilePage from "../../components/Profile/SharedProfilePage";

const StaffProfile = () => {
  return (
    <MainLayout>
      <SharedProfilePage userRole="Staff" />
    </MainLayout>
  );
};

export default StaffProfile;

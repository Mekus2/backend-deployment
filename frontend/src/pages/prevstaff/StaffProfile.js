// PrevStaffProfile.js
import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedProfilePage from "../../components/Profile/SharedProfilePage";

const PrevStaffProfile = () => {
  return (
    <MainLayout>
      <SharedProfilePage userRole="PrevStaff" />
    </MainLayout>
  );
};

export default PrevStaffProfile;

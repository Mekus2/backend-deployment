import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedReturnsPage from "../../components/Returns/SharedReturnsPage"; // Ensure the path is correct

const SuperAdminReturns = () => {
  return (
    <MainLayout>
      <SharedReturnsPage />
    </MainLayout>
  );
};

export default SuperAdminReturns;

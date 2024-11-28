import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedIssuesPage from "../../components/Issues/SharedIssuesPage"; // Ensure the path is correct

const SuperAdminReturns = () => {
  return (
    <MainLayout>
      <SharedIssuesPage />
    </MainLayout>
  );
};

export default SuperAdminReturns;

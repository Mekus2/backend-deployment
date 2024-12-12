import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedIssuesPage from "../../components/Delivery/Issues/SharedIssuesPage"; // Ensure the path is correct

const AdminReturns = () => {
  return (
    <MainLayout>
      <SharedIssuesPage />
    </MainLayout>
  );
};

export default AdminReturns;

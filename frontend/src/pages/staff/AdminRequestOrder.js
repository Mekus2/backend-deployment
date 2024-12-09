// src/pages/AdminRequestOrder.js
import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedRequestsPage from "../../components/Orders/Request Order/SharedRequestsPage";

const AdminRequestOrder = () => {
  // Assuming the current user is an admin
  const isAdmin = true; // Replace this with the actual logic to check if the user is an admin

  return (
    <MainLayout>
      <SharedRequestsPage showRequestButton={isAdmin} />
    </MainLayout>
  );
};

export default AdminRequestOrder;

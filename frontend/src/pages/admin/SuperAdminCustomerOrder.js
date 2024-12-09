import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedCustomerOrdersPage from "../../components/Orders/Customer Order/SharedCustomerOrdersPage"; // Ensure the path is correct

const SuperAdminCustomerOrder = () => {
  const userRole = "superadmin"; // Declare the user role

  return (
    <MainLayout>
      <SharedCustomerOrdersPage userRole={userRole} /> {/* Pass the user role */}
    </MainLayout>
  );
};

export default SuperAdminCustomerOrder;

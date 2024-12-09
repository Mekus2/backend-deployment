import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedCustomerOrdersPage from "../../components/Orders/Customer Order/SharedCustomerOrdersPage"; // Ensure the path is correct

const AdminCustomerOrder = () => {
  return (
    <MainLayout>
      <SharedCustomerOrdersPage />
    </MainLayout>
  );
};

export default AdminCustomerOrder;

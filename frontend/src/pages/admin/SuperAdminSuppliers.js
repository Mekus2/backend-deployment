import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedSuppliersPage from "../../components/Suppliers/SharedSuppliersPage"; // Ensure the path is correct

const SuperAdminSuppliers = () => {
  return (
    <MainLayout>
      <SharedSuppliersPage />
    </MainLayout>
  );
};

export default SuperAdminSuppliers;

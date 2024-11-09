// StaffSupplierDelivery.js
import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedSupplierDeliveryPage from "../../components/Delivery/SupplierDelivery/SharedSupplierDeliveryPage"; // Adjust path if necessary

const StaffSupplierDelivery = () => {
  const userRole = "staff"; // Declare the user role

  return (
    <MainLayout>
      <SharedSupplierDeliveryPage userRole={userRole} /> {/* Pass the user role */}
    </MainLayout>
  );
};

export default StaffSupplierDelivery;

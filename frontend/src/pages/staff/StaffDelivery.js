import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedDeliveriesPage from "../../components/Delivery/SharedDeliveriesPage"; // Ensure the path is correct

const StaffDelivery = () => {
  return (
    <MainLayout>
      <SharedDeliveriesPage />
    </MainLayout>
  );
};

export default StaffDelivery;

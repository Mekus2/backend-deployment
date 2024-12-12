// StaffCustomerDelivery.js
import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedCustomerDeliveryPage from "../../components/Delivery/CustomerDelivery/SharedCustomerDeliveryPage"; // Adjust path if necessary

const StaffCustomerDelivery = () => {
  const userRole = "prevstaff"; // Declare the user role

  return (
    <MainLayout>
      <SharedCustomerDeliveryPage userRole={userRole} />{" "}
      {/* Pass the user role */}
    </MainLayout>
  );
};

export default StaffCustomerDelivery;

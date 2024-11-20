// AdminNotification.js
import React from "react";
import MainLayout from "../../components/Layout/MainLayout";
import SharedNotificationsPage from "../../components/Notifications/SharedNotificationsPage"; // Adjust the path as necessary

const AdminNotification = () => {
  return (
    <MainLayout>
      <SharedNotificationsPage />
    </MainLayout>
  );
};

export default AdminNotification;

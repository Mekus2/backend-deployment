// src/components/CardsData/CardTotalNotification.js

import React from "react";
import Card from "../Layout/Card"; // Import the reusable Card component
import { NOTIFICATION } from "../../data/NotificationData"; // Import the notification data
import styled from "styled-components";
import { FaBell } from "react-icons/fa"; // Import an icon from react-icons

const CardTotalNotification = () => {
  const totalNotifications = NOTIFICATION.length; // Calculate total notifications here

  return (
    <CardContainer>
      <Card
        label="Notifications"
        value={totalNotifications} // Display the total number of notifications
        icon={<FaBell />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalNotification;

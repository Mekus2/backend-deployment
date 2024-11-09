// src/components/CardsData/CardTotalDelivery.js
import React from "react";
import Card from "../Layout/Card"; // Import the reusable Card component
import { DELIVERY } from "../../data/DeliveryData"; // Import the delivery data
import styled from "styled-components";
import { FaTruck } from "react-icons/fa"; // Import an icon from react-icons

const CardTotalDelivery = () => {
  const deliveryCount = DELIVERY.length;

  return (
    <CardContainer>
      <Card
        label="Deliveries"
        value={deliveryCount} // Display the total number of deliveries
        icon={<FaTruck />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalDelivery;

import React from "react";
import Card from "../Layout/Card";
import INBOUND_DELIVERY from "../../data/InboundData";
import styled from "styled-components";
import { FaClipboardList } from "react-icons/fa";

const CardTotalSupplierDelivery = () => {
  // Corrected to access the correct array of deliveries
  const inboundDeliveryCount = INBOUND_DELIVERY.INBOUND_DELIVERY.length;

  return (
    <CardContainer>
      <Card
        label="Inbound Delivery"
        value={inboundDeliveryCount} // Display the total number of inbound deliveries
        icon={<FaClipboardList />} // Updated icon
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalSupplierDelivery;

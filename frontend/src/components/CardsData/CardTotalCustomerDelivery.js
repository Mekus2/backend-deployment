import React from "react";
import Card from "../Layout/Card";
import OUTBOUND_DELIVERY from "../../data/OutboundData";
import styled from "styled-components";
import { FaClipboardList } from "react-icons/fa";

const CardTotalCustomerDelivery = () => {
  // Corrected to access the correct array of deliveries
  const outboundDeliveryCount = OUTBOUND_DELIVERY.OUTBOUND_DELIVERY.length;

  return (
    <CardContainer>
      <Card
        label="Outbound Delivery"
        value={outboundDeliveryCount} // Display the total number of inbound deliveries
        icon={<FaClipboardList />} // Updated icon
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCustomerDelivery;

import React from "react";
import Card from "../Layout/Card";
import { SALES_ORDER } from "../../data/CustomerOrderData";
import styled from "styled-components";
import { FaClipboardList } from "react-icons/fa";

const CardTotalCustomerOrder = () => {
  const salesOrderCount = SALES_ORDER.length;

  return (
    <CardContainer>
      <Card
        label="Customer Orders"
        value={salesOrderCount} // Display the total number of Customer Orders
        icon={<FaClipboardList />} // Updated icon
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCustomerOrder;

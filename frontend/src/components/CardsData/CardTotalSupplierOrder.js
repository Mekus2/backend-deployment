import React from "react";
import Card from "../Layout/Card"; // Import the reusable Card component
import PURCHASE_ORDERS from "../../data/SupplierOrderData"; // Import the purchase order data as default
import styled from "styled-components";
import { FaClipboardCheck } from "react-icons/fa"; // Keeping the existing icon for Supplier Orders

const CardTotalSupplierOrder = () => {
  // Calculation for total number of Supplier Orders
  const purchaseOrderCount = PURCHASE_ORDERS.length; // Count total purchase orders

  return (
    <CardContainer>
      <Card
        label="Supplier Orders"
        value={purchaseOrderCount} // Display the total number of Supplier Orders
        icon={<FaClipboardCheck />} // Keeping the existing icon
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalSupplierOrder;

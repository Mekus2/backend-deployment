import React, { useEffect, useState } from "react";
import Card from "../Layout/Card"; // Import the reusable Card component
import PURCHASE_ORDERS from "../../data/SupplierOrderData"; // Import the purchase order data as default
import styled from "styled-components";
import { FaClipboardCheck } from "react-icons/fa"; // Keeping the existing icon for Supplier Orders
import { fetchPurchaseOrders } from "../../api/fetchPurchaseOrders";

const CardTotalSupplierOrder = () => {
  const [purchaseOrderCount, setPurchaseOrderCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await fetchPurchaseOrders();
      setPurchaseOrderCount(orders.length);
    };

    fetchOrders();
    const interValId = setInterval(fetchOrders, 20000);
  }, []);

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

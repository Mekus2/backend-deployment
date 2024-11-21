import React, { useEffect, useState } from "react";
import Card from "../Layout/Card";
// import OUTBOUND_DELIVERY from "../../data/OutboundData";
import styled from "styled-components";
import { FaClipboardList } from "react-icons/fa";

import { fetchCountOrders } from "../../api/CustomerDeliveryApi";

const CardTotalCustomerDelivery = () => {
  // Corrected to access the correct array of deliveries
  const [CustomerDelCount, setCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await fetchCountOrders();
      setCount(orders.pending_total);
    };
    fetchOrders();
    const intervalId = setInterval(fetchOrders, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <CardContainer>
      <Card
        label="Outbound Delivery"
        value={CustomerDelCount} // Display the total number of inbound deliveries
        icon={<FaClipboardList />} // Updated icon
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCustomerDelivery;

import React, { useEffect, useState } from "react";
import Card from "../Layout/Card";
import styled from "styled-components";
import { FaClipboardList } from "react-icons/fa";
import { fetchCustomerOrders } from "../../api/fetchCustomerOrders";

const CardTotalCustomerOrder = () => {
  const [salesOrderCount, setSalesOrderCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await fetchCustomerOrders();
      setSalesOrderCount(orders.length);
    };

    fetchOrders(); // Initial fetch on mount

    const intervalId = setInterval(fetchOrders, 20000); // Fetch every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmountz
  }, []);

  return (
    <CardContainer>
      <Card
        label="Customer Orders"
        value={salesOrderCount} // Display the total number of Customer Orders
        icon={<FaClipboardList />}
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCustomerOrder;

import React from "react";
import { FaDollarSign } from "react-icons/fa"; // Import an icon for sales
import Card from "../Layout/Card";
import { SALES_ORDER } from "../../data/CustomerOrderData"; // Assuming the path is correct
import PURCHASE_ORDERS from "../../data/SupplierOrderData"; // Assuming the path is correct
import styled from "styled-components";

// Function to calculate total sales for all time
const calculateTotalSalesAllTime = (orders) => {
  return orders.reduce((total, order) => {
    // Add only sales orders
    return total + (order.amount > 0 ? order.amount : 0);
  }, 0);
};

// Function to format currency with commas, space before peso sign, and always two decimal places
const formatCurrency = (value) => {
  return `₱ ${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const CardTotalSales = () => {
  // Combine sales and purchase orders
  const combinedOrders = [];

  // Process sales orders
  SALES_ORDER.forEach((order) => {
    combinedOrders.push({
      date: order.SALES_ORDER_DLVRY_DATE,
      amount: order.SALES_ORDER_PROD_TOTAL,
    });
  });

  // Process purchase orders (as expenses, they are negative)
  PURCHASE_ORDERS.forEach((order) => {
    combinedOrders.push({
      date: order.PURCHASE_ORDER_DATE,
      amount: -order.PURCHASE_ORDER_TOTAL,
    });
  });

  // Calculate total sales for all time
  const totalSalesAllTime = calculateTotalSalesAllTime(combinedOrders);

  return (
    <CardContainer>
      <Card
        label="All Time Sales" // Updated label
        value={formatCurrency(totalSalesAllTime)} // Display the total sales amount with formatting
        icon={<FaDollarSign />} // Add the sales icon
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalSales;

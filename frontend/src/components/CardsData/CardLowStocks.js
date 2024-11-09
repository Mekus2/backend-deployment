import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Card from "../Layout/Card";
import productData from "../../data/ProductData";
import styled from "styled-components";

const CardLowStocks = () => {
  const lowStockThreshold = 10;
  const inventory = productData?.PRODUCT_INVENTORY;

  // Ensure inventory is defined before using filter
  if (!inventory) {
    return <p>Loading inventory data...</p>;
  }

  // Get a list of low-stock products and their quantities
  const lowStockProducts = inventory
    .filter((item) => item.PROD_INV_QTY_ON_HAND <= lowStockThreshold)
    .map((item) => {
      const product = productData.PRODUCT.find(
        (p) => p.PROD_ID === item.PROD_ID
      );
      return product
        ? { name: product.PROD_NAME, quantity: item.PROD_INV_QTY_ON_HAND }
        : null;
    })
    .filter(Boolean) // Remove any nulls
    .sort((a, b) => a.quantity - b.quantity); // Sort by quantity ascending

  const lowStockCount = lowStockProducts.length; // Get count of low stock items

  return (
    <CardContainer>
      <Card
        label="Low Stocks"
        value={lowStockCount}
        icon={<FaExclamationTriangle />}
      />
      <Tooltip>
        <TooltipText>
          <ul>
            {lowStockProducts.map(({ name, quantity }, index) => (
              <li key={index}>
                {name} <span>({quantity})</span>
              </li>
            ))}
          </ul>
        </TooltipText>
      </Tooltip>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
  position: relative;
  &:hover div {
    display: block; // Show tooltip on hover
  }
`;

const Tooltip = styled.div`
  margin-top: 5px;
  display: none; // Initially hidden
  position: absolute;
  background-color: white;
  color: red;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 4px;
  z-index: 10;
  top: 100%;
  left: 50%; // Center horizontally
  transform: translateX(-50%); // Offset for centering
  width: 200px; // Adjust width as necessary
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const TooltipText = styled.div`
  font-size: 0.9rem;
  color: #d51024;
  margin: 0; // Reset margin

  ul {
    list-style-type: none; // Remove default list styling
    padding: 0; // Reset padding
  }

  li {
    display: flex; // Flexbox for alignment
    justify-content: space-between; // Space out name and quantity
    margin-bottom: 5px; // Add space between items
  }

  span {
    color: #d9534f; // Color for quantity
  }
`;

export default CardLowStocks;

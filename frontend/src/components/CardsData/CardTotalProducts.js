// src/components/CardsData/CardTotalProducts.js
import React from "react";
import { FaBox } from "react-icons/fa"; // Import an icon for products
import Card from "../Layout/Card"; // Import the reusable Card component
import SampleInventoryData from "../../data/InventoryData"; // Import the inventory data
import styled from "styled-components";

const CardTotalProducts = () => {
  // Calculate the total number of products
  const totalProducts = SampleInventoryData.length;

  return (
    <CardContainer>
      <Card
        label="Products"
        value={totalProducts} // Display the total number of products
        icon={<FaBox />} // Add the products icon
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalProducts;

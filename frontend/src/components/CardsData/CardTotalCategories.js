import React from "react";
import { FaTags } from "react-icons/fa"; // Import an icon from react-icons
import Card from "../Layout/Card";
import productData from "../../data/ProductData";
import styled from "styled-components";

const CardTotalCategories = () => {
  // Calculate the total number of categories
  const totalCategories = productData.PRODUCT_CATEGORY.length;

  return (
    <CardContainer>
      <Card
        label="Total Categories"
        value={totalCategories} // Display the total number of categories
        icon={<FaTags />} // Pass the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCategories;

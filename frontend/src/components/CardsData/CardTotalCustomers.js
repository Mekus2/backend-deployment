// src/components/CardsData/CardTotalCustomers.js

import React from "react";
import Card from "../Layout/Card"; // Import the reusable Card component
import customersData from "../../data/ClientsData"; // Import customer data
import styled from "styled-components";
import { FaUsers } from "react-icons/fa"; // Import an icon from react-icons

const CardTotalCustomers = () => {
  // Calculate the total number of customers
  const totalCustomers = customersData.length;

  return (
    <CardContainer>
      <Card
        label="Customers"
        value={totalCustomers} // Display the total number of customers
        icon={<FaUsers />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCustomers;

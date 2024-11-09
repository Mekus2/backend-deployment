// src/components/CardTotalTransactions.js

import React from "react";
import Card from "../Layout/Card";
import { sales as initialSales } from "../../data/SalesData";
import styled from "styled-components";
import { FaExchangeAlt } from "react-icons/fa"; // Import an icon from react-icons

const calculateTotalTransactions = (sales) => {
  return sales.length; // Return the number of transactions
};

const CardTotalTransactions = () => {
  const totalTransactions = calculateTotalTransactions(initialSales);

  return (
    <CardContainer>
      <Card
        label="Transactions"
        value={totalTransactions} // Display the total number of transactions
        icon={<FaExchangeAlt />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalTransactions;

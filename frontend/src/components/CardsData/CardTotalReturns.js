// src/components/CardsData/CardTotalReturns.js

import React from "react";
import Card from "../Layout/Card";
import returnsData from "../../data/ReturnsData";
import styled from "styled-components";
import { FaUndoAlt } from "react-icons/fa"; // Import an icon from react-icons

const CardTotalReturns = () => {
  // Calculate the total number of returns
  const totalReturns = returnsData.length;

  return (
    <CardContainer>
      <Card
        label="Orders w/ Issues"
        value={totalReturns} // Display the total number of returns
        icon={<FaUndoAlt />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalReturns;

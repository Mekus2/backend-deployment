import React from "react";
import Card from "../Layout/Card"; // Import the reusable Card component
import styled from "styled-components";
import { FaDollarSign } from "react-icons/fa"; // Import an icon from react-icons

const CardTotalInventoryValue = () => {
  const totalInventoryValue = "₱ 11,680,000"; // Static value for demonstration

  return (
    <CardContainer>
      <Card
        label="Inventory Value"
        value={totalInventoryValue}
        icon={<FaDollarSign />}
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalInventoryValue;

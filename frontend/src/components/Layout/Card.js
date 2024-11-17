// src/components/Card.js
import React from "react";
import styled from "styled-components";
import { colors } from "../../colors"; // Ensure colors are correctly imported

const Card = ({ label, value, bgColor = colors.primary, icon }) => {
  return (
    <CardContainer bgColor={bgColor}>
      {icon && <IconContainer>{icon}</IconContainer>}
      <CardContent>
        <TextContainer>
          <Value>{value}</Value>
          <Label>{label}</Label>
        </TextContainer>
      </CardContent>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  position: relative; // Make sure the icon can be positioned absolutely
  background-color: ${(props) => props.bgColor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 14px;
  border-radius: 8px;
  flex: 1;
  min-width: 160px;
  max-width: 160px; // Allow card to expand up to its container width
  text-align: left;
  display: flex;
  align-items: center;
  overflow: hidden; // Hide overflowed content
  transition: box-shadow 0.3s ease; // Smooth transition for shadow

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); // Larger shadow on hover
  }
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  width: 150px;
`;

const TextContainer = styled.div`
  overflow: hidden;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 450;
  white-space: nowrap; // Prevent label from wrapping
  overflow: hidden;
  text-overflow: ellipsis; // Add ellipsis if text overflows
`;

const Value = styled.p`
  font-size: 20px;
  font-weight: bold;
  white-space: nowrap; // Prevent value from wrapping
  overflow: hidden;
  text-overflow: ellipsis; // Add ellipsis if text overflows
`;

const IconContainer = styled.div`
  position: absolute; // Position icon at the upper right
  top: 8px;
  right: -15px;
  font-size: 90px;
  color: rgba(255, 255, 255, 0.2); // Reduce opacity for a creative effect
`;

export default Card;

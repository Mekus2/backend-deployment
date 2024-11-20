import React from "react";
import styled from "styled-components";
import { colors } from "../../colors"; // Ensure colors are correctly imported

// Utility function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Utility function to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const ReportCard = ({ 
  label, 
  value, 
  startDate, 
  endDate, 
  bgColor = colors.primary, 
  icon, 
  isCurrency = false // Add a prop to determine if value is currency
}) => {
  return (
    <CardContainer bgColor={bgColor}>
      {icon && <IconContainer>{icon}</IconContainer>}
      <CardContent>
        <Label>{label}</Label>
        {/* Format the value with commas and conditionally add peso sign */}
        <Value>{isCurrency ? `₱${formatNumber(value)}` : `${formatNumber(value)}`}</Value>
        {/* Conditionally render DateContainer only if both dates are provided */}
        {startDate && endDate && (
          <DateContainer>
            <DateLabel>{`From: ${formatDate(startDate)}`}</DateLabel>
            <DateLabel>{`To: ${formatDate(endDate)}`}</DateLabel>
          </DateContainer>
        )}
      </CardContent>
    </CardContainer>
  );
};

// Styled components
const CardContainer = styled.div`
  position: relative;
  background-color: ${(props) => props.bgColor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: white;
  padding: 14px;
  border-radius: 8px;
  flex: 1;
  min-width: 200px; 
  max-width: 200px;
  text-align: left;
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  margin-right: 20px;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 50%;
`;

const Label = styled.span`
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Value = styled.p`
  font-size: 25px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Updated DateLabel for bold text
const DateContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateLabel = styled.span`
  font-size: 12px;
  font-weight: 600; // Change to bold
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IconContainer = styled.div`
  position: absolute;
  top: 8px;
  right: -15px;
  font-size: 90px;
  color: rgba(255, 255, 255, 0.2);
`;

export default ReportCard;

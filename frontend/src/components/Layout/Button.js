import React from "react";
import styled from "styled-components";
import { colors } from "../../colors"; // Adjust path if necessary

const Button = ({ variant = "primary", onClick, children, ...props }) => {
  // Define different styles for each button variant
  const variantColors = {
    primary: {
      backgroundColor: colors.primary, // Assuming you have a primary color defined
      hoverColor: colors.primaryHover, // Assuming you have a hover color defined for primary
      textColor: "white",
    },
    red: {
      backgroundColor: colors.red, // Red color for deactivate
      hoverColor: colors.redHover, // Red hover color
      textColor: "white",
    },
    green: {
      backgroundColor: colors.green, // Green color for activate
      hoverColor: colors.greenHover, // Green hover color
      textColor: "white",
    },
    // You can add more variants if needed, such as 'warning', 'blue', etc.
  };

  // Select the variant based on the variant prop passed
  const selectedVariant = variantColors[variant] || variantColors.primary;

  return (
    <StyledButton
      backgroundColor={selectedVariant.backgroundColor}
      hoverColor={selectedVariant.hoverColor}
      color={selectedVariant.textColor}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  padding: 7px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 2px 3.5px;
  transition: background-color 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${(props) => props.hoverColor};
  }
`;

export default Button;

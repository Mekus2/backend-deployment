// src/components/Button.js
import React from "react";
import styled from "styled-components";
import { colors } from "../../colors"; // Adjust path as necessary

const Button = ({ variant = "primary", onClick, children, ...props }) => {
  const variantColors = {
    primary: {
      backgroundColor: colors.primary,
      hoverColor: colors.primaryHover,
      textColor: "white",
    },
    red: {
      backgroundColor: colors.red,
      hoverColor: colors.redHover,
      textColor: "white",
    },
    // You can add more variants if needed, such as 'green', 'warning', etc.
  };

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

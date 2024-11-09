import React from "react";
import styled from "styled-components";
import Modal from "../Layout/Modal"; // Reusable Modal component
import { colors } from "../../colors";

// Utility function to format numbers as currency
const formatCurrency = (amount) => {
  return `₱${amount.toFixed(2)}`;
};

const ReturnDetailModal = ({ returnItem = {}, onClose, onCancelReturn }) => {
  const calculateSubTotal = () => {
    if (!returnItem.products) return 0;
    return returnItem.products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  };

  const calculateTotalQuantity = () => {
    if (!returnItem.products) return 0;
    return returnItem.products.reduce(
      (total, product) => total + product.quantity,
      0
    );
  };

  const canBeCancelled = returnItem.status !== "Completed";

  return (
    <Modal
      title="Return Details"
      status={returnItem.status}
      completedDate={returnItem.returnDate}
      onClose={onClose}
    >
      <DetailsContainer>
        <Column align="left">
          <FormGroup>
            <Label>Name:</Label>
            <Value>{returnItem.name || ""}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Return Date:</Label>
            <Value>{returnItem.returnDate || ""}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Type:</Label>
            <Value>{returnItem.type || ""}</Value>
          </FormGroup>
        </Column>
      </DetailsContainer>

      <FormGroup>
        <DescriptionBox>
          <p>{returnItem.description || "No description available."}</p>
        </DescriptionBox>
      </FormGroup>

      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Price</TableHeader>
          </tr>
        </thead>
        <tbody>
          {(returnItem.products || []).map((product, index) => (
            <TableRow key={index}>
              <TableCell>{product.productName || ""}</TableCell>
              <TableCell>{product.quantity || 0}</TableCell>
              <TableCell>{formatCurrency(product.price || 0)}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      <FormSection>
        <FormGroup>
          <Label>Order Sub Total:</Label>
          <Value>{formatCurrency(calculateSubTotal())}</Value>
        </FormGroup>
        <FormGroup>
          <Label>Total Quantity:</Label>
          <Value>{calculateTotalQuantity()}</Value>
        </FormGroup>
      </FormSection>

      {canBeCancelled && (
        <ActionsContainer>
          <CancelButton onClick={() => onCancelReturn(returnItem.id)}>
            Cancel Return
          </CancelButton>
        </ActionsContainer>
      )}
    </Modal>
  );
};

// Styled components

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Column = styled.div`
  width: 48%;
  text-align: ${(props) => props.align || "left"};
`;

const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const Label = styled.div`
  font-weight: bold;
  color: black;
`;

const Value = styled.div`
  color: ${colors.text};
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-top: 15px;
  margin-bottom: 20px;
`;

const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

const FormSection = styled.div`
  margin-top: 20px;
`;

const DescriptionBox = styled.div`
  border: 1px solid #3b3b3bf7;
  border-radius: 4px;
  padding: 10px;
  max-height: 100px;
  overflow-y: auto;
  width: 100%;
  text-align: left;
  background: #f9f9f9;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;  // Align the button to the right
  margin-top: 20px;
`;

const CancelButton = styled.button`
  background-color: #ff4d4d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  &:hover {
    background-color: #ff1f1f;
  }
`;

export default ReturnDetailModal;

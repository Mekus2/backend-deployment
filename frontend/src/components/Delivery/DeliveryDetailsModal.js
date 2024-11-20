import React from "react";
import styled from "styled-components";
import Modal from "../Layout/Modal"; // Importing the reusable Modal component
import { colors } from "../../colors"; // Assuming colors is defined as per your application
import Button from "../Layout/Button"; // Assuming your Button component is in this path

// Utility function to format numbers as currency
const formatCurrency = (amount) => {
  return `₱${amount.toFixed(2)}`;
};

const DeliveryDetailsModal = ({ delivery = {}, onClose, onAccept, onCancel }) => {
  const calculateSubTotal = () => {
    if (!delivery.ORDER_DETAILS) return 0;
    return delivery.ORDER_DETAILS.reduce(
      (sum, item) => sum + item.PRICE * item.QUANTITY,
      0
    );
  };

  const calculateTotalAfterDiscount = () => {
    const subTotal = calculateSubTotal();
    if (!delivery.DISCOUNT) return subTotal;
    if (typeof delivery.DISCOUNT === "string" && delivery.DISCOUNT.includes("%")) {
      const discountPercentage = parseFloat(delivery.DISCOUNT) / 100;
      return subTotal - subTotal * discountPercentage;
    } else {
      return subTotal - parseFloat(delivery.DISCOUNT);
    }
  };

  const calculateTotalQuantity = () => {
    if (!delivery.ORDER_DETAILS) return 0;
    return delivery.ORDER_DETAILS.reduce(
      (total, item) => total + item.QUANTITY,
      0
    );
  };

  return (
    <Modal
      data-cy="delivery-details-modal"
      title="Delivery Details"
      status={delivery.DELIVERY_STATUS}
      completedDate={delivery.COMPLETED_DATE}
      onClose={onClose}
    >
      <DetailsContainer>
        <Column align="left">
          <FormGroup>
            <Label>Name:</Label>
            <Value>{delivery.DELIVERY_NAME || ""}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Date:</Label>
            <Value>{delivery.DELIVERY_DATE || ""}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Type:</Label>
            <Value>{delivery.DELIVERY_TYPE || ""}</Value>
          </FormGroup>
        </Column>
      </DetailsContainer>

      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Price</TableHeader>
          </tr>
        </thead>
        <tbody>
          {(delivery.ORDER_DETAILS || []).map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.PRODUCT_NAME || ""}</TableCell>
              <TableCell>{item.QUANTITY || 0}</TableCell>
              <TableCell>{formatCurrency(item.PRICE || 0)}</TableCell>
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
        <FormGroup>
          <Label>Discount:</Label>
          <Discount>{delivery.DISCOUNT || ""}</Discount>
        </FormGroup>
        <FormGroup>
          <Label>Order Total:</Label>
          <Total>{formatCurrency(calculateTotalAfterDiscount())}</Total>
        </FormGroup>
      </FormSection>

      {delivery.DELIVERY_STATUS === "Pending" && (
        <ModalFooter>
          <ButtonGroup>
            <Button variant="red" onClick={onClose}>
              Return
            </Button>
            <Button variant="red" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="blue" onClick={onAccept}>
              Accept
            </Button>
          </ButtonGroup>
        </ModalFooter>
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

const Discount = styled.div`
  color: #ff5757;
  font-weight: bold;
`;

const Total = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #1dba0b;
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

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export default DeliveryDetailsModal;

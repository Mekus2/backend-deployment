import React from "react";
import styled from "styled-components";
import { colors } from "../../colors";
import { IoCloseCircle } from "react-icons/io5";

// Utility function to format numbers as currency
const formatCurrency = (amount) => `₱${amount.toFixed(2)}`;

const SalesDetailsModal = ({ sale = {}, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Utility functions to calculate the totals and discounts
  const calculateSubTotal = () => {
    if (!sale.orderDetails) return 0;
    return sale.orderDetails.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
  };

  const calculateTotalAfterDiscount = () => {
    const subTotal = calculateSubTotal();
    if (!sale.discount) return subTotal;
    if (typeof sale.discount === "string" && sale.discount.includes("%")) {
      const discountPercentage = parseFloat(sale.discount) / 100;
      return subTotal - subTotal * discountPercentage;
    } else {
      return subTotal - parseFloat(sale.discount);
    }
  };

  const calculateTotalQuantity = () => {
    if (!sale.orderDetails) return 0;
    return sale.orderDetails.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );
  };

  const calculateGrossProfit = () => {
    if (!sale.orderDetails) return 0;

    const totalRevenue = calculateTotalAfterDiscount();
    const totalCost = sale.orderDetails.reduce(
      (sum, item) => sum + (item.cost || 0) * (item.quantity || 0),
      0
    );
    return totalRevenue - totalCost;
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal>
        <CloseButton onClick={onClose}>
          <IoCloseCircle color="#ff5757" size={24} />
        </CloseButton>

        <Title>Sales Details</Title>

        <DetailsContainer>
          <Column align="left">
            <FormGroup>
              <Label>Invoice ID:</Label>
              <Value>{sale.SALES_INV_ID || "N/A"}</Value>
            </FormGroup>
            <FormGroup>
              <Label>Date/Time:</Label>
              <Value>{sale.SALES_INV_DATETIME || "N/A"}</Value>
            </FormGroup>
            <FormGroup>
              <Label>Client ID:</Label>
              <Value>{sale.CLIENT_ID || "N/A"}</Value>
            </FormGroup>
          </Column>
        </DetailsContainer>

        {/* Product Details Table */}
        <ProductTable>
          <thead>
            <tr>
              <TableHeader>Type</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Cost</TableHeader>
              <TableHeader>Revenue</TableHeader>
              <TableHeader>Gross Profit</TableHeader>
            </tr>
          </thead>
          <tbody>
            {(sale.orderDetails || []).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.type || "N/A"}</TableCell>
                <TableCell>{item.date || "N/A"}</TableCell>
                <TableCell>{formatCurrency(item.cost || 0)}</TableCell>
                <TableCell>{formatCurrency(item.price * item.quantity || 0)}</TableCell>
                <TableCell>{formatCurrency((item.price * item.quantity) - (item.cost * item.quantity) || 0)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </ProductTable>

        {/* Totals and Summary Section */}
        <SummarySection>
          <FormGroup>
            <Label>Total Quantity:</Label>
            <Value>{calculateTotalQuantity()}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Order Sub Total:</Label>
            <Value>{formatCurrency(calculateSubTotal())}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Order Total After Discount:</Label>
            <Value>{formatCurrency(calculateTotalAfterDiscount())}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Gross Profit:</Label>
            <Value>{formatCurrency(calculateGrossProfit())}</Value>
          </FormGroup>
        </SummarySection>
      </Modal>
    </Backdrop>
  );
};

// Styled components

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  padding: 20px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

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

const SummarySection = styled.div`
  margin-top: 20px;
`;

export default SalesDetailsModal;

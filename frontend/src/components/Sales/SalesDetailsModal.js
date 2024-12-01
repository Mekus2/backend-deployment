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

  const calculateGrandTotal = () => {
    if (!sale.orderDetails) return 0;
    return sale.orderDetails.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal>
        <CloseButton onClick={onClose}>
          <IoCloseCircle color="#ff5757" size={24} />
        </CloseButton>

        <Title>Sales Invoice</Title>

        {/* Invoice Details Section */}
        <DetailsContainer>
          <DetailsColumn>
            <Detail><strong>Invoice ID:</strong> {sale.SALES_INV_ID || "N/A"}</Detail>
            <Detail><strong>Delivery ID:</strong> {sale.DELIVERY_ID || "N/A"}</Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail><strong>Customer Name:</strong> {sale.CUSTOMER_NAME || "N/A"}</Detail>
            <Detail><strong>Payment Terms:</strong> {sale.PAYMENT_TERMS || "N/A"}</Detail>
          </DetailsColumn>
          <DetailsColumn>
            <Detail><strong>Payment Status:</strong> {sale.PAYMENT_STATUS || "N/A"}</Detail>
            <Detail><strong>Amount Paid:</strong> {formatCurrency(sale.AMOUNT || 0)}</Detail>
            <Detail><strong>Balance:</strong> {formatCurrency(sale.BALANCE || 0)}</Detail>
          </DetailsColumn>
        </DetailsContainer>

        {/* Product Details Table */}
        <ProductTable>
          <thead>
            <tr>
              <TableHeader>Product Name</TableHeader>
              <TableHeader>Qty</TableHeader>
              <TableHeader>Sell Price</TableHeader>
              <TableHeader>Purchase Price</TableHeader>
              <TableHeader>Total</TableHeader>
            </tr>
          </thead>
          <tbody>
            {/* Static Table Data */}
            <TableRow>
              <TableCell>Product A</TableCell>
              <TableCell>2</TableCell>
              <TableCell>{formatCurrency(500)}</TableCell>
              <TableCell>{formatCurrency(300)}</TableCell>
              <TableCell>{formatCurrency(1000)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Product B</TableCell>
              <TableCell>1</TableCell>
              <TableCell>{formatCurrency(700)}</TableCell>
              <TableCell>{formatCurrency(400)}</TableCell>
              <TableCell>{formatCurrency(700)}</TableCell>
            </TableRow>
          </tbody>
        </ProductTable>

        {/* Summary Section */}
        <SummarySection>
          <GrandTotal>
            <strong>Grand Total:</strong> {formatCurrency(1700)}
          </GrandTotal>
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
  max-width: 700px;
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

const Title = styled.h1`
  text-align: left;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1.8rem;
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const DetailsColumn = styled.div`
  flex: 1;
  padding: 0 10px;
  text-align: left;
`;

const Detail = styled.div`
  margin-bottom: 10px;
  font-size: 0.9rem;
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin: 15px 0;
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
  text-align: right;
  margin-top: 20px;
`;

const GrandTotal = styled.div`
  font-size: 1rem;
`;

export default SalesDetailsModal;

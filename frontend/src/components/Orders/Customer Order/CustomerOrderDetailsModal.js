import React from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import { colors } from "../../../colors";
import Button from "../../Layout/Button"; // Ensure you import the Button component

const CustomerOrderDetailsModal = ({ order, onClose, userRole }) => {
  if (!order) return null;

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return "₱0.00";
    }
    return `₱${amount.toFixed(2)}`;
  };

  const orderDetails = order.ORDER_DETAILS || [];

  const totalQuantity = orderDetails.reduce(
    (total, detail) => total + (detail.SALES_ORDER_QTY || 0),
    0
  );

  const totalAmount = orderDetails.reduce(
    (total, detail) => total + (detail.SALES_ORDER_LINE_TOTAL || 0),
    0
  );

  // Handlers for the buttons
  const handleAcceptOrder = () => {
    // Logic to accept the order
    console.log("Order accepted");
    onClose(); // Close modal after action
  };

  const handleCancelOrder = () => {
    // Logic to cancel the order
    console.log("Order cancelled");
    onClose(); // Close modal after action
  };

  // Conditionally render the Accept and Cancel buttons if status is "Pending" and role is either admin or superadmin
  const canModifyOrder = order.SALES_ORDER_PYMNT_STAT === "Pending" && (userRole === "admin" || userRole === "superadmin");

  return (
    <Modal
      title="Customer Order Details"
      status={order.SALES_ORDER_PYMNT_STAT}
      onClose={onClose}
    >
      <Section>
        <p>
          <strong>Order ID:</strong> {order.SALES_ORDER_ID}
        </p>
        <p>
          <strong>Order Created Date:</strong> {order.SALES_ORDER_DATACREATED}
        </p>
        <p>
          <strong>Delivery Date:</strong> {order.SALES_ORDER_DLVRY_DATE || "N/A"}
        </p>
        <p>
          <strong>Discount:</strong> {formatCurrency(order.SALES_ORDER_DISCOUNT || 0)}
        </p>
        <p>
          <strong>Delivery Option:</strong> {order.SALES_ORDER_DLVRY_OPT || "N/A"}
        </p>
        <p>
          <strong>Client ID:</strong> {order.CLIENT_ID}
        </p>
      </Section>
      <Section>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Product Name</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Total</TableHeader>
              </tr>
            </thead>
            <tbody>
              {orderDetails.length > 0 ? (
                orderDetails.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{detail.SALES_ORDER_PROD_NAME || "Unknown Product"}</TableCell>
                    <TableCell>{detail.SALES_ORDER_QTY || 0}</TableCell>
                    <TableCell>{formatCurrency(detail.SALES_ORDER_PRICE || 0)}</TableCell>
                    <TableCell>{formatCurrency(detail.SALES_ORDER_LINE_TOTAL || 0)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>No order details available.</TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableWrapper>
        <TotalSummary>
          <TotalItem>
            <strong>Total Quantity:</strong> {totalQuantity}
          </TotalItem>
          <TotalItem>
            <strong>Total Amount:</strong>{" "}
            <HighlightedTotal>{formatCurrency(totalAmount)}</HighlightedTotal>
          </TotalItem>
        </TotalSummary>
      </Section>

      {/* Conditionally render the Accept and Cancel buttons if the user has permission */}
      {canModifyOrder && (
        <ButtonGroup>
          <Button variant="red" onClick={handleCancelOrder}>
            Cancel Order
          </Button>
          <Button variant="primary" onClick={handleAcceptOrder}>
            Accept Order
          </Button>
        </ButtonGroup>
      )}
    </Modal>
  );
};

// Styled Components
const Section = styled.div`
  margin-bottom: 20px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 12px;
  text-align: center;
  font-size: 16px;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  text-align: center;
  padding: 8px;
  font-size: 14px;
  border-bottom: 1px solid #ddd;
`;

const TotalSummary = styled.div`
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: flex-end; /* Align items to the right */
  margin-top: 20px;
  font-weight: bold;
`;

const TotalItem = styled.p`
  margin: 5px 0; /* Add some margin for spacing */
`;

const HighlightedTotal = styled.span`
  color: green; /* Highlight total amount in green */
  font-size: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  margin-top: 20px; /* Space above the buttons */
  gap: 10px; /* Optional: add some space between buttons */
`;

export default CustomerOrderDetailsModal;

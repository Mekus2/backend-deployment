import React from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Assuming you have a modal component
import { colors } from "../../../colors"; // Ensure the path to colors is correct
import Button from "../../Layout/Button"; // Ensure you import the Button component

const SupplierOrderDetailsModal = ({ order, onClose }) => {
  // Early return if order is not provided
  if (!order) return null;

  // Function to format currency values safely
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return "₱0.00"; // Default value if input is undefined or null
    }
    return `₱${amount.toFixed(2)}`; // Format to two decimal places
  };

  // Find the order details associated with the selected order
  const orderDetails = order.ORDER_DETAILS || [];

  // Calculate total quantity
  const totalQuantity = orderDetails.reduce(
    (total, detail) => total + (detail.PURCH_ORDER_QTY || 0),
    0
  );

  // Calculate total amount by summing the total for each item
  const totalAmount = orderDetails.reduce((total, detail) => {
    const lineTotal =
      (detail.PURCH_ORDER_QTY || 0) * (detail.PURCH_ORDER_PRICE || 0); // Calculate total for each item
    return total + lineTotal; // Sum up the totals
  }, 0);

  // Handlers for the buttons
  const handleAcceptOrder = () => {
    // Logic to accept the order
    console.log("Supplier order accepted");
    onClose(); // Close modal after action
  };

  const handleCancelOrder = () => {
    // Logic to cancel the order
    console.log("Supplier order cancelled");
    onClose(); // Close modal after action
  };

  return (
    <Modal
      title="Supplier Order Details"
      status={order.PURCHASE_ORDER_STATUS}
      completedDate={order.PURCHASE_ORDER_DATE}
      onClose={onClose}
    >
      <Section>
        <p>
          <strong>Order ID:</strong> {order.PURCHASE_ORDER_ID}
        </p>
        <p>
          <strong>Order Created Date:</strong> {order.PURCHASE_ORDER_DATE}
        </p>
        <p>
          <strong>Supplier ID:</strong> {order.SUPPLIER_ID}
        </p>{" "}
        {/* Displaying Supplier ID */}
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
                orderDetails.map((detail) => {
                  const lineTotal =
                    (detail.PURCH_ORDER_QTY || 0) *
                    (detail.PURCH_ORDER_PRICE || 0); // Calculate line total
                  return (
                    <TableRow key={detail.PURCH_ORDER_DET_ID}>
                      <TableCell>{detail.PURCH_ORDER_PROD_NAME}</TableCell>
                      <TableCell>{detail.PURCH_ORDER_QTY || 0}</TableCell>
                      <TableCell>
                        {formatCurrency(detail.PURCH_ORDER_PRICE || 0)}
                      </TableCell>
                      <TableCell>{formatCurrency(lineTotal)}</TableCell>{" "}
                      {/* Display calculated line total */}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>No order details available.</TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableWrapper>
        <TotalSummary>
          <SummaryItem>
            <strong>Total Quantity:</strong> {totalQuantity}
          </SummaryItem>
          <SummaryItem>
            <strong>Total Amount:</strong>{" "}
            <HighlightedTotal>{formatCurrency(totalAmount)}</HighlightedTotal>
          </SummaryItem>
        </TotalSummary>
      </Section>

      {/* Conditionally render the Accept and Cancel buttons if status is "Pending" */}
      {order.PURCHASE_ORDER_STATUS === "Pending" && (
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

const SummaryItem = styled.div`
  margin-top: 10px; /* Add space between items */
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

export default SupplierOrderDetailsModal;

import React from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import { colors } from "../../../colors"; // Ensure the path to colors is correct
import Button from "../../Layout/Button"; // Import the Button component

const RequestDetailsModal = ({ request, onClose, onCancel }) => {
  if (!request) return null;

  const handleCancelOrder = () => {
    // Implement the logic for canceling the order
    if (onCancel) {
      onCancel(request.id); // Assuming request has an id property
    }
  };

  return (
    <Modal
      title="Request Details"
      status={request.status}
      completedDate={request.deliveryDateExpected}
      onClose={onClose}
    >
      <Section>
        <p>
          <strong>Request By:</strong> {request.requestBy}
        </p>
        <p>
          <strong>Request Date:</strong> {request.requestDate}
        </p>
        <p>
          <strong>Status:</strong> {request.status}
        </p>
        {request.deliveryDateExpected && (
          <p>
            <strong>Expected Delivery Date:</strong>{" "}
            {request.deliveryDateExpected}
          </p>
        )}
        <p>
          <strong>Description:</strong> {request.description}
        </p>
        <p>
          <strong>Client ID:</strong> {request.clientID}
        </p>
      </Section>
      <Section>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Product Name</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader>Total</TableHeader>
              </tr>
            </thead>
            <tbody>
              {request.orderDetails.map((detail, index) => {
                const price = detail.price ? detail.price.toFixed(2) : "N/A";
                const total = detail.price
                  ? (detail.price * detail.quantity).toFixed(2)
                  : "N/A";

                return (
                  <TableRow key={index}>
                    <TableCell>{detail.productName}</TableCell>
                    <TableCell>₱{price}</TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>₱{total}</TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </TableWrapper>
        <TotalSummary>
          <p>
            <strong>Products:</strong>{" "}
            {request.orderDetails.reduce(
              (total, item) => total + item.quantity,
              0
            )}
          </p>
        </TotalSummary>
      </Section>
      {/* Conditionally render the Cancel Order button */}
      {request.status === "Pending" && (
        <ButtonGroup>
          <Button variant="red" onClick={handleCancelOrder}>
            Cancel Order
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
  margin-top: 20px;
  text-align: right;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export default RequestDetailsModal;

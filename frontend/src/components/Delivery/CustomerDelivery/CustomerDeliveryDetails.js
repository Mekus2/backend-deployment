import React, { useState } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import { colors } from "../../../colors";
import Button from "../../Layout/Button";

// Define getProgressForStatus function outside of the component to avoid initialization errors
const getProgressForStatus = (status) => {
  switch (status) {
    case "Pending":
      return 0;
    case "In Transit":
      return 50;
    case "Delivered":
      return 100;
    default:
      return 0;
  }
};

const CustomerDeliveryDetails = ({ delivery, deliveryDetails, onClose, onStatusUpdate }) => {
  const [status, setStatus] = useState(delivery.OUTBOUND_DEL_STATUS); // Manage the status using state
  const [receivedDate, setReceivedDate] = useState(delivery.OUTBOUND_DEL_DATE_CUST_RCVD || "Not Received");
  const [expiryDates, setExpiryDates] = useState(
    deliveryDetails.map(() => "") // Initialize expiryDates as empty strings
  );
  const progress = getProgressForStatus(status); // Calculate progress percentage

  // Calculate the total quantity shipped
  const calculateTotalQuantity = () => {
    return deliveryDetails.reduce(
      (total, item) => total + item.OUTBOUND_DEL_DETAIL_QTY_SHIPPED,
      0
    );
  };

  // Handle status change
  const handleStatusChange = () => {
    let newStatus;
    if (status === "Pending") {
      newStatus = "In Transit"; // Change to In Transit
    } else if (status === "In Transit") {
      newStatus = "Delivered"; // Change to Delivered
      const currentDate = new Date().toISOString().split("T")[0]; // Get the current date in YYYY-MM-DD format
      setReceivedDate(currentDate); // Set the received date to the current date
      delivery.OUTBOUND_DEL_DATE_CUST_RCVD = currentDate; // Update the delivery data object
    } else if (status === "Delivered") {
      newStatus = "Pending"; // Revert back to Pending
      setReceivedDate("Not Received"); // Clear the received date when reverting to Pending
    }

    setStatus(newStatus); // Update the status locally
    onStatusUpdate({ ...delivery, OUTBOUND_DEL_STATUS: newStatus }); // Notify parent of status update
  };

  // Handle expiry date change per row
  const handleExpiryDateChange = (index, date) => {
    const updatedExpiryDates = [...expiryDates];
    updatedExpiryDates[index] = date;
    setExpiryDates(updatedExpiryDates);
  };

  // Get current date for restricting past dates
  const currentDate = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format

  return (
    <Modal
      data-cy="outbound-delivery-details-modal"
      title="Outbound Delivery Details"
      status={status}
      onClose={onClose}
    >
      <DetailsContainer>
        <Column>
          <FormGroup>
            <Label>Delivery ID:</Label>
            <Value>{delivery.OUTBOUND_DEL_ID}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Shipped Date:</Label>
            <Value>{delivery.OUTBOUND_DEL_SHIPPED_DATE}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received Date:</Label>
            <Value>{receivedDate}</Value>
          </FormGroup>
        </Column>
        <Column>
          <FormGroup>
            <Label>Delivery Option:</Label>
            <Value>{delivery.OUTBOUND_DEL_DLVRY_OPT}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Total Quantity:</Label>
            <Value>{calculateTotalQuantity()}</Value>
          </FormGroup>
          <FormGroup>
            <Label>City:</Label>
            <Value>{delivery.OUTBOUND_DEL_CITY}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Province:</Label>
            <Value>{delivery.OUTBOUND_DEL_PROVINCE}</Value>
          </FormGroup>
        </Column>
      </DetailsContainer>

      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Quantity Shipped</TableHeader>
            <TableHeader>Expiry Date</TableHeader>
          </tr>
        </thead>
        <tbody>
          {deliveryDetails.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.PROD_NAME}</TableCell>
              <TableCell>{item.OUTBOUND_DEL_DETAIL_QTY_SHIPPED}</TableCell>
              <TableCell>
                <input
                  type="date"
                  value={expiryDates[index]}
                  onChange={(e) => handleExpiryDateChange(index, e.target.value)}
                  min={currentDate} // Disable past dates
                />
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Progress Bar Section */}
      <ProgressSection>
        <ProgressBar>
          <ProgressFiller progress={progress} />
        </ProgressBar>
        <ProgressText>{progress}%</ProgressText>
      </ProgressSection>

      {/* Status Buttons */}
      <ModalFooter>
        <StatusButton onClick={handleStatusChange}>
          {status === "Pending"
            ? "Mark as In Transit"
            : status === "In Transit"
            ? "Mark as Delivered"
            : "Mark as Pending"}
        </StatusButton>
      </ModalFooter>
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

const ProgressSection = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin: 10px 0;
`;

const ProgressFiller = styled.div`
  height: 100%;
  width: ${(props) => props.progress}%;
  background-color: ${colors.primary};
  border-radius: 10px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  color: ${colors.primary};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const StatusButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-left: 10px;

  &:hover {
    background-color: ${colors.primaryHover};
  }
`;

export default CustomerDeliveryDetails;

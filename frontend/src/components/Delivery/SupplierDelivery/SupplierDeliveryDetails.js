import React, { useState } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import { colors } from "../../../colors";
import INBOUND_DELIVERY from "../../../data/InboundData"; // Import the data

const SupplierDeliveryDetails = ({ delivery, deliveryDetails, onClose }) => {
  const [status, setStatus] = useState(delivery.INBOUND_DEL_STATUS); // Use state to track the status
  const [receivedDate, setReceivedDate] = useState(delivery.INBOUND_DEL_DATE_RCVD || "Not yet Received"); // Use state for received date
  const [expiryDates, setExpiryDates] = useState(
    Array(deliveryDetails.length).fill("") // Track expiry dates as an array
  );
  const [receivedClicked, setReceivedClicked] = useState(false); // Track if the Mark as Received button was clicked
  const today = new Date().toISOString().split("T")[0]; // Get today's date for validation

  // Function to get the Supplier Name by Supplier ID
  const getSupplierNameById = (supplierId) => {
    const supplier = INBOUND_DELIVERY.INBOUND_DELIVERY.find(
      (item) => item.SUPP_ID === supplierId
    )?.SUPPLIER;
    return supplier ? supplier.SUPP_NAME : "Unknown Supplier";
  };

  // Function to get the User's Full Name by User ID
  const getUserFullNameById = (userId) => {
    const user = INBOUND_DELIVERY.INBOUND_DELIVERY.find(
      (item) => item.INBOUND_DEL_RCVD_BY_USER_ID === userId
    )?.USER;
    return user ? `${user.USER_FIRSTNAME} ${user.USER_LASTNAME}` : "Unknown User";
  };

  // Function to handle status update
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus); // Update the status state
    delivery.INBOUND_DEL_STATUS = newStatus; // This would be a way to mutate the status in the object

    if (newStatus === "Received") {
      const currentDate = new Date().toISOString().split("T")[0];
      setReceivedDate(currentDate);
      delivery.INBOUND_DEL_DATE_RCVD = currentDate; // Set the current date as received date in the data
    }
  };

  // Get progress percentage for each status
  const getProgressPercentage = () => {
    switch (status) {
      case "Awaiting":
        return 33; // 33% progress for Awaiting
      case "In Transit":
        return 66; // 66% progress for In Transit
      case "Received":
        return 100; // 100% progress for Received
      default:
        return 0;
    }
  };

  // Update expiry date for specific row
  const handleExpiryDateChange = (index, value) => {
    const newExpiryDates = [...expiryDates];
    newExpiryDates[index] = value; // Set the specific index with new date value
    setExpiryDates(newExpiryDates);
  };

  // Calculate total value for each product (Quantity Delivered * Price per Unit)
  const calculateItemTotal = (qty, price) => qty * price;

  // Calculate total quantity and total amount for the summary
  const totalQuantity = deliveryDetails.reduce((total, item) => total + item.INBOUND_DEL_DETAIL_QTY_DLVRD, 0);
  const totalAmount = deliveryDetails.reduce((total, item) => total + calculateItemTotal(item.INBOUND_DEL_DETAIL_QTY_DLVRD, item.PRICE_PER_UNIT), 0);

  // Check if all expiry dates are filled
  const areAllExpiryDatesFilled = expiryDates.every((date) => date !== "");

  // Handle the Mark as Received button click
  const handleMarkAsReceivedClick = () => {
    setReceivedClicked(true); // Set to true when the button is clicked

    if (!areAllExpiryDatesFilled) {
      return; // Do not allow status change if expiry dates are not filled
    }

    handleStatusChange("Received");
  };

  return (
    <Modal
      data-cy="inbound-delivery-details-modal"
      title="Inbound Delivery Details"
      status={status}
      onClose={onClose}
    >
      <DetailsContainer>
        <Column>
          <FormGroup>
            <Label>Delivery ID:</Label>
            <Value>{delivery.INBOUND_DEL_ID}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Supplier Name:</Label>
            <Value>{getSupplierNameById(delivery.SUPP_ID)}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received Date:</Label>
            <Value>{receivedDate}</Value>
          </FormGroup>

        </Column>
        <Column>

          <FormGroup>
            <Label>Date Created:</Label>
            <Value>{delivery.INBOUND_DEL_DATECREATED}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Delivery Option:</Label>
            <Value>{delivery.INBOUND_DEL_DLVRY_OPT}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received By:</Label>
            <Value>{getUserFullNameById(delivery.INBOUND_DEL_RCVD_BY_USER_ID)}</Value>
          </FormGroup>
        </Column>
      </DetailsContainer>

      {/* Product Table */}
      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Quantity Delivered</TableHeader>
            <TableHeader>Expiry Date</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Total</TableHeader>
          </tr>
        </thead>
        <tbody>
          {deliveryDetails.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.PROD_NAME}</TableCell>
              <TableCell>{item.INBOUND_DEL_DETAIL_QTY_DLVRD}</TableCell>
              <TableCell>
                <InputContainer>
                  <input
                    type="date"
                    min={today} // Set min date to today for future validation
                    value={expiryDates[index] || ""} // Access individual expiry date
                    onChange={(e) => handleExpiryDateChange(index, e.target.value)} // Handle change for specific index
                  />
                  {/* Show asterisk if the button is clicked and expiry date is empty */}
                  {receivedClicked && expiryDates[index] === "" && <Asterisk>*</Asterisk>}
                </InputContainer>
              </TableCell>
              <TableCell>₱{item.PRICE_PER_UNIT.toFixed(2)}</TableCell>
              <TableCell>₱{calculateItemTotal(item.INBOUND_DEL_DETAIL_QTY_DLVRD, item.PRICE_PER_UNIT).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Summary Section */}
      <TotalSummary>
        <SummaryItem>
          <strong>Total Quantity:</strong> {totalQuantity}
        </SummaryItem>
        <SummaryItem>
          <strong>Total Amount:</strong> <HighlightedTotal>₱{totalAmount.toFixed(2)}</HighlightedTotal>
        </SummaryItem>
      </TotalSummary>

      {/* Progress Bar */}
      <ProgressSection>
        <ProgressBar>
          <ProgressFiller progress={getProgressPercentage()} />
        </ProgressBar>
        <ProgressText>{getProgressPercentage()}%</ProgressText>
      </ProgressSection>

      {/* Status Change Buttons */}
      <ModalFooter>
        {status === "Awaiting" && (
          <StatusButton onClick={() => handleStatusChange("In Transit")}>
            Mark as In Transit
          </StatusButton>
        )}
        {status === "In Transit" && (
          <StatusButton onClick={handleMarkAsReceivedClick}>
            Mark as Received
          </StatusButton>
        )}
        {status === "Received" && (
          <StatusButton onClick={() => handleStatusChange("Awaiting")}>
            Mark as Awaiting
          </StatusButton>
        )}
      </ModalFooter>
    </Modal>
  );
};

// Styled components (no changes here)
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

const TotalSummary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 20px;
  font-weight: bold;
`;

const SummaryItem = styled.div`
  margin-top: 10px;
`;

const HighlightedTotal = styled.span`
  color: green;
  font-size: 16px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const StatusButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${colors.primaryDark};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Asterisk = styled.span`
  color: red;
  margin-left: 5px;
  font-size: 18px;
`;

export default SupplierDeliveryDetails;

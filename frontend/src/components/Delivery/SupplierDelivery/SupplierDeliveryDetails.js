import React, { useEffect, useState } from "react";
import Modal from "../../Layout/Modal";
import INBOUND_DELIVERY from "../../../data/InboundData"; // Import the data

// Import the styles
import {
  DetailsContainer,
  Column,
  FormGroup,
  Label,
  Value,
  ProgressSection,
  ProgressBar,
  ProgressFiller,
  ProgressText,
  ProductTable,
  TableHeader,
  TableRow,
  TableCell,
  TotalSummary,
  SummaryItem,
  HighlightedTotal,
  ModalFooter,
  StatusButton,
  InputContainer,
  Asterisk,
} from "./SupplierDeliveryStyles"; // Adjust the import path as needed

const SupplierDeliveryDetails = ({ delivery, deliveryDetails, onClose }) => {
  const [status, setStatus] = useState(delivery.INBOUND_DEL_STATUS); // Use state to track the status
  const [receivedDate, setReceivedDate] = useState(
    delivery.INBOUND_DEL_DATE_RCVD || "Not yet Received"
  ); // Use state for received date
  const [expiryDates, setExpiryDates] = useState(
    Array(deliveryDetails.length).fill("") // Track expiry dates as an array
  );
  const [qtyAccepted, setQtyAccepted] = useState(
    Array(deliveryDetails.length).fill(0) // Track accepted quantities, initialized to 0
  );
  const [receivedClicked, setReceivedClicked] = useState(false); // Track if the Mark as Received button was clicked
  const today = new Date().toISOString().split("T")[0]; // Get today's date for validation

  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (order.PURCHASE_ORDER_ID) {
        setLoading(true);
        setError(null);
        try {
          console.log(
            `Fetching details for Order ID: ${order.PURCHASE_ORDER_ID}`
          );
          const details = await fetchPurchaseDetailsById(
            order.PURCHASE_ORDER_ID,
            controller.signal
          );
          console.log("Received Details:", details);
          setOrderDetails(details);
        } catch (err) {
          if (err.name === "AbortError") {
            console.log("Fetch aborted"); // Request was canceled
          } else {
            console.error("Failed to fetch order details:", err); // Improved debug line for errors
            setError("Failed to fetch order details.");
          }
        } finally {
          setLoading(false);
        }
      }
    };
  }, []);

  // Early return if order is not provided
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!orderDetails) return null;
  if (!order) return null;

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
    return user
      ? `${user.USER_FIRSTNAME} ${user.USER_LASTNAME}`
      : "Unknown User";
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

  // Function to handle Qty Accepted input change
  const handleQtyAcceptedChange = (index, value) => {
    const qtyOrdered = deliveryDetails[index].INBOUND_DEL_DETAIL_QTY_DLVRD;
    const newQtyAccepted = [...qtyAccepted];
    const parsedValue = parseInt(value, 10);

    // If value is empty, we reset to 0, otherwise we set the new value
    if (value === "") {
      newQtyAccepted[index] = 0;
    } else if (
      isNaN(parsedValue) ||
      parsedValue < 0 ||
      parsedValue > qtyOrdered
    ) {
      newQtyAccepted[index] = 0;
    } else {
      newQtyAccepted[index] = parsedValue;
    }

    setQtyAccepted(newQtyAccepted);
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
  const totalQuantity = deliveryDetails.reduce(
    (total, item) => total + item.INBOUND_DEL_DETAIL_QTY_DLVRD,
    0
  );
  const totalAmount = deliveryDetails.reduce(
    (total, item) =>
      total +
      calculateItemTotal(
        item.INBOUND_DEL_DETAIL_QTY_DLVRD,
        item.PRICE_PER_UNIT
      ),
    0
  );

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

  // Calculate Qty Defect (Difference between Delivered Quantity and Accepted Quantity)
  const calculateQtyDefect = (index) => {
    const qtyDelivered = deliveryDetails[index].INBOUND_DEL_DETAIL_QTY_DLVRD;
    const qtyAcceptedForItem = qtyAccepted[index];
    return qtyAcceptedForItem ? qtyDelivered - qtyAcceptedForItem : 0; // Show defect as 0 if not accepted
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
            <Value>
              {getUserFullNameById(delivery.INBOUND_DEL_RCVD_BY_USER_ID)}
            </Value>
          </FormGroup>
        </Column>
      </DetailsContainer>

      {/* Product Table */}
      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Qty Ordered</TableHeader>
            <TableHeader>Qty Accepted</TableHeader>{" "}
            {/* Added column for Qty Accepted */}
            <TableHeader>Qty Defect</TableHeader>{" "}
            {/* Added column for Qty Defect */}
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
                <input
                  type="number"
                  min="0"
                  max={item.INBOUND_DEL_DETAIL_QTY_DLVRD}
                  value={qtyAccepted[index] === 0 ? "" : qtyAccepted[index]} // Show 0 as empty string
                  onChange={(e) =>
                    handleQtyAcceptedChange(index, e.target.value)
                  }
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px",
                    borderRadius: "4px",
                  }}
                />
              </TableCell>
              <TableCell>
                {/* Calculate the Qty Defect, show 0 if not accepted */}
                {calculateQtyDefect(index)}
              </TableCell>
              <TableCell>
                <InputContainer>
                  <input
                    type="date"
                    min={today} // Set min date to today for future validation
                    value={expiryDates[index] || ""} // Access individual expiry date
                    onChange={(e) =>
                      handleExpiryDateChange(index, e.target.value)
                    } // Handle change for specific index
                    style={{
                      border: "1px solid #ccc",
                      padding: "5px",
                      borderRadius: "4px",
                    }}
                  />
                  {receivedClicked && expiryDates[index] === "" && (
                    <Asterisk>*</Asterisk>
                  )}
                </InputContainer>
              </TableCell>
              <TableCell>₱{item.PRICE_PER_UNIT.toFixed(2)}</TableCell>
              <TableCell>
                ₱
                {(
                  item.INBOUND_DEL_DETAIL_QTY_DLVRD * item.PRICE_PER_UNIT
                ).toFixed(2)}
              </TableCell>
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
          <strong>Total Amount:</strong>{" "}
          <HighlightedTotal>₱{totalAmount.toFixed(2)}</HighlightedTotal>
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

export default SupplierDeliveryDetails;

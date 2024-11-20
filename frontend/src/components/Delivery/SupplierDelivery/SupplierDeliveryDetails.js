import React, { useEffect, useState, useRef } from "react";
import Modal from "../../Layout/Modal";
// import INBOUND_DELIVERY from "../../../data/InboundData"; // Import the data
import { fetchOrderDetails } from "../../../api/SupplierDeliveryApi";
import { updateOrderStatus } from "../../../api/SupplierDeliveryApi";

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

const SupplierDeliveryDetails = ({ delivery, onClose }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState(""); // Use state to track the status
  const [receivedDate, setReceivedDate] = useState("Not yet Received"); // Use state for received date
  const [expiryDates, setExpiryDates] = useState(
    Array((orderDetails || []).length).fill("") // Track expiry dates as an array
  );
  const [qtyAccepted, setQtyAccepted] = useState(
    Array((orderDetails || []).length).fill(0) // Track accepted quantities, initialized to 0
  );
  const [receivedClicked, setReceivedClicked] = useState(false); // Track if the Mark as Received button was clicked
  const today = new Date().toISOString().split("T")[0]; // Get today's date for validation

  useEffect(() => {
    const fetchDetails = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (delivery.INBOUND_DEL_ID) {
        setLoading(true);
        setError(null);
        try {
          console.log(
            `Fetching details for Order ID: ${delivery.INBOUND_DEL_ID}`
          );
          const details = await fetchOrderDetails(
            delivery.INBOUND_DEL_ID,
            controller.signal
          );
          console.log("Received Details:", details);
          setOrderDetails(details);
          setStatus(delivery.INBOUND_DEL_STATUS);
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
    fetchDetails();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Early return if order is not provided
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!orderDetails) return null;
  if (!delivery) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Return empty string if invalid date
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Function to handle status update
  const handleStatusChange = async (
    orderId,
    currentStatus,
    expiryDates = []
  ) => {
    // Validate expiry dates only for 'Dispatched' to 'Delivered' transition
    if (currentStatus === "Dispatched") {
      const areAllExpiryDatesFilled = expiryDates.every((date) => date !== "");
      if (!areAllExpiryDatesFilled) {
        console.error("Please fill in all expiry dates.");
        return; // Stop the status change if expiry dates are empty
      }
    }

    let newStatus;

    switch (currentStatus) {
      case "Pending":
        newStatus = "Dispatched";
        break;
      case "Dispatched":
        newStatus = "Delivered";
        break;
      default:
        console.error("Invalid status:", currentStatus);
        return;
    }

    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      if (updatedOrder) {
        console.log("Order updated successfully:", updatedOrder);
        alert("Order updated successfully");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Order update failed");
      onClose();
    }
  };

  // Function to handle Qty Accepted input change
  const handleQtyAcceptedChange = (index, value) => {
    const qtyOrdered = orderDetails[index].INBOUND_DEL_DETAIL_ORDERED_QTY;
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
      case "Pending":
        return 33; // 33% progress for Awaiting
      case "Dispatched":
        return 66; // 66% progress for In Transit
      case "Delivered":
        return 100; // 100% progress for Received
      default:
        return 0; // Default progress if status is unknown
    }
  };

  // Update expiry date for specific row
  const handleExpiryDateChange = (index, value) => {
    const newExpiryDates = [...expiryDates];
    newExpiryDates[index] = value; // Set the specific index with new date value
    setExpiryDates(newExpiryDates);
  };

  // Calculate total value for each product (Quantity Delivered * Price per Unit)
  const calculateItemTotal = (qtyAccepted, price) => qtyAccepted * price;

  // Calculate total quantity and total amount for the summary
  const totalQuantity = orderDetails.reduce(
    (total, item) => total + item.INBOUND_DEL_DETAIL_ORDERED_QTY,
    0
  );
  const totalAmount = orderDetails.reduce(
    (total, item, index) =>
      total +
      calculateItemTotal(
        qtyAccepted[index], // Use qtyAccepted instead of qtyOrdered
        item.INBOUND_DEL_DETAIL_LINE_PRICE
      ),
    0
  );

  // Check if all expiry dates are filled
  // const areAllExpiryDatesFilled = expiryDates.every((date) => date !== "");

  // Handle the Mark as Received button click
  const handleMarkAsReceivedClick = () => {
    setReceivedClicked(true); // Custom behavior (if needed)

    if (!expiryDates.every((date) => date !== "")) {
      console.error("Please fill in all expiry dates.");
      return;
    }

    handleStatusChange(delivery.INBOUND_DEL_ID, status, expiryDates);
  };
  // Calculate Qty Defect (Difference between Delivered Quantity and Accepted Quantity)
  const calculateQtyDefect = (index) => {
    const qtyDelivered = orderDetails[index].INBOUND_DEL_DETAIL_ORDERED_QTY;
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
            <Value>{delivery.INBOUND_DEL_SUPP_NAME}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received Date:</Label>
            <Value>{receivedDate}</Value>
          </FormGroup>
        </Column>
        <Column>
          <FormGroup>
            <Label>Date Created:</Label>
            <Value>{formatDate(delivery.INBOUND_DEL_ORDER_DATE_CREATED)}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received By:</Label>
            <Value>{delivery.OUTBOUND_DEL_ACCPTD_BY_USER || ""}</Value>
          </FormGroup>
        </Column>
      </DetailsContainer>

      {/* Product Table */}
      {/* Product Table */}
      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Qty Ordered</TableHeader>
            <TableHeader>Qty Accepted</TableHeader>
            <TableHeader>Qty Defect</TableHeader>
            <TableHeader>Expiry Date</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Total</TableHeader>
          </tr>
        </thead>
        <tbody>
          {orderDetails.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.INBOUND_DEL_DETAIL_PROD_NAME}</TableCell>
              <TableCell>{item.INBOUND_DEL_DETAIL_ORDERED_QTY}</TableCell>
              <TableCell>
                <input
                  type="number"
                  min="0"
                  max={item.INBOUND_DEL_DETAIL_LINE_QTY}
                  value={qtyAccepted[index] === 0 ? "" : qtyAccepted[index]} // Show 0 as empty string
                  onChange={(e) =>
                    handleQtyAcceptedChange(index, e.target.value)
                  }
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px",
                    borderRadius: "4px",
                    appearance: "none", // Remove the up/down arrows in the input field
                    WebkitAppearance: "none", // Remove for Safari
                    MozAppearance: "textfield", // Remove for Firefox
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
              <TableCell>
                <input
                  type="number"
                  value={item.INBOUND_DEL_DETAIL_LINE_PRICE || ""} // Allow customization of the price
                  min="0" // Ensure price cannot be negative
                  onChange={(e) => {
                    // Validate price input
                    const newPrice = parseFloat(e.target.value);
                    if (isNaN(newPrice) || newPrice < 0) {
                      // If invalid, keep the previous valid value
                      return;
                    }
                    // Update the price for the product in the orderDetails array
                    const updatedOrderDetails = [...orderDetails];
                    updatedOrderDetails[index].INBOUND_DEL_DETAIL_LINE_PRICE =
                      newPrice;
                    setOrderDetails(updatedOrderDetails);
                  }}
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px",
                    borderRadius: "4px",
                    appearance: "none", // Remove the up/down arrows in the input field
                    WebkitAppearance: "none", // Remove for Safari
                    MozAppearance: "textfield", // Remove for Firefox
                  }}
                />
              </TableCell>

              <TableCell>
                ₱
                {calculateItemTotal(
                  qtyAccepted[index], // Use qtyAccepted instead of qtyOrdered
                  item.INBOUND_DEL_DETAIL_LINE_PRICE
                ).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Summary Section */}
      <TotalSummary>
        <SummaryItem>
          <strong>Total Qty Ordered:</strong> {totalQuantity}
        </SummaryItem>
        <SummaryItem>
          <strong>Total Qty Accepted:</strong>{" "}
          {qtyAccepted.reduce((total, qty) => total + qty, 0)}
        </SummaryItem>
        <SummaryItem>
          <strong>Total Amount:</strong>{" "}
          <HighlightedTotal>₱{totalAmount.toFixed(2)}</HighlightedTotal>
        </SummaryItem>
      </TotalSummary>

      {/* Progress Bar */}
      {/* Progress Bar */}
      <ProgressSection>
        <ProgressBar>
          <ProgressFiller progress={getProgressPercentage()} />
        </ProgressBar>
        <ProgressText>{getProgressPercentage()}%</ProgressText>
      </ProgressSection>

      {/* Status Change Buttons */}
      <ModalFooter>
        {status === "Pending" && (
          <StatusButton
            onClick={() => handleStatusChange(delivery.INBOUND_DEL_ID, status)}
          >
            Mark as In Transit
          </StatusButton>
        )}
        {status === "Dispatched" && (
          <StatusButton onClick={handleMarkAsReceivedClick}>
            Mark as Received
          </StatusButton>
        )}
        {/* {status === "Delivered" && (
          <StatusButton
            onClick={() => handleStatusChange(delivery.INBOUND_DEL_ID, status)}
          >
            Mark as Awaiting
          </StatusButton>
        )} */}
      </ModalFooter>
    </Modal>
  );
};

export default SupplierDeliveryDetails;

import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import { colors } from "../../../colors";
import Button from "../../Layout/Button"; // Ensure you import the Button component

// Import api functions
import { fetchOrderDetailsById } from "../../../api/fetchCustomerOrders";

const CustomerOrderDetailsModal = ({ order, onClose, userRole }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      // Abort any existing request before starting a new one
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new AbortController instance for the current request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (order.SALES_ORDER_ID) {
        setLoading(true);
        setError(null);
        try {
          console.log(`Fetching details for Order ID: ${order.SALES_ORDER_ID}`); // Debug line
          const details = await fetchOrderDetailsById(
            order.SALES_ORDER_ID,
            controller.signal
          );
          console.log("Received Details:", details); // Debug line
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

    fetchDetails();

    // Clean-up function to abort any ongoing fetch when the component unmounts or order changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [order, userRole]);

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount); // Convert to a number if possible

    if (
      isNaN(numericAmount) ||
      numericAmount === undefined ||
      numericAmount === null
    ) {
      return "₱0.00"; // Default value if input is undefined, null, or not a number
    }
    return `₱${numericAmount.toFixed(2)}`; // Format to two decimal places
  };

  // const orderDetails = order.ORDER_DETAILS || [];
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!orderDetails) return null; // Early return if no order details
  if (!order) return null;

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
  const canModifyOrder =
    order.SALES_ORDER_STATUS === "Pending" &&
    (userRole === "admin" || userRole === "superadmin");

  return (
    <Modal
      title="Customer Order Details"
      status={order.SALES_ORDER_STATUS}
      onClose={onClose}
    >
      <Section>
        <p>
          <strong>Order ID:</strong> {order.SALES_ORDER_ID}
        </p>
        <p>
          <strong>Order Created Date:</strong>
          {(() => {
            const date = new Date(order.SALES_ORDER_DATE_CREATED);
            if (!isNaN(date)) {
              const day = String(date.getDate()).padStart(2, "0");
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const year = date.getFullYear();
              return `${month}/${day}/${year}`;
            }
            return "Invalid Date";
          })()}
        </p>
        {/* <p>
          <strong>Delivery Date:</strong>{" "}
          {order.SALES_ORDER_DLVRY_DATE || "N/A"}
        </p> */}
        <p>
          <strong>Discount:</strong>{" "}
          {formatCurrency(order.SALES_ORDER_TOTAL_DISCOUNT || 0)}
        </p>
        <p>
          <strong>Delivery Option:</strong>{" "}
          {order.SALES_ORDER_DLVRY_OPTION || "N/A"}
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
                    <TableCell>
                      {detail.SALES_ORDER_PROD_NAME || "Unknown Product"}
                    </TableCell>
                    <TableCell>{detail.SALES_ORDER_LINE_QTY || 0}</TableCell>
                    <TableCell>
                      {formatCurrency(detail.SALES_ORDER_LINE_PRICE || 0)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(detail.SALES_ORDER_LINE_TOTAL || 0)}
                    </TableCell>
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

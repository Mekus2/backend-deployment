import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Assuming you have a modal component
import { colors } from "../../../colors"; // Ensure the path to colors is correct
import Button from "../../Layout/Button"; // Ensure you import the Button component
import { fetchPurchaseDetailsById } from "../../../api/fetchPurchaseOrders";

const SupplierOrderDetailsModal = ({ order, onClose, userRole }) => {
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
    fetchDetails();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [order, userRole]);

  // Early return if order is not provided
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!orderDetails) return null;
  if (!order) return null;

  // Function to format currency values safely
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return "₱0.00"; // Default value if input is undefined or null
    }
    return `₱${amount.toFixed(2)}`; // Format to two decimal places
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Return empty string if invalid date
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

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
          <strong>Order Created Date:</strong>{" "}
          {formatDate(order.PURCHASE_ORDER_DATE_CREATED)}
        </p>
        <p>
          <strong>Supplier ID:</strong> {order.PURCHASE_ORDER_SUPPLIER_ID}
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
                {/* <TableHeader>Price</TableHeader>
                <TableHeader>Total</TableHeader> */}
              </tr>
            </thead>
            <tbody>
              {orderDetails.length > 0 ? (
                orderDetails.map((detail) => {
                  // const lineTotal =
                  //   (detail.PURCH_ORDER_QTY || 0) *
                  //   (detail.PURCH_ORDER_PRICE || 0); // Calculate line total
                  return (
                    <TableRow key={detail.PURCHASE_ORDER_DET_ID}>
                      <TableCell>
                        {detail.PURCHASE_ORDER_DET_PROD_NAME}
                      </TableCell>
                      <TableCell>
                        {detail.PURCH_ORDER_QTY || 0}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(detail.PURCH_ORDER_PRICE || 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(lineTotal)} {/* Displaying line total */}
                      </TableCell>
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

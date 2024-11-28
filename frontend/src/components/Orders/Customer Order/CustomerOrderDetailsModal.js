import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Assuming you have a modal component
import { colors } from "../../../colors"; // Ensure the path to colors is correct
import Button from "../../Layout/Button"; // Ensure you import the Button component
import { fetchOrderDetailsById } from "../../../api/fetchCustomerOrders";
import { addNewCustomerDelivery } from "../../../api/CustomerDeliveryApi";
import EditCustomerOrderModal from "./EditCustomerOrderModal"; // Importing the EditCustomerOrderModal
import {
  Table,
  TotalSection,
  TotalRow,
  TotalLabel,
  TotalValue,
  ButtonGroup,
} from "../OrderStyles";

const CustomerOrderDetailsModal = ({ order, onClose, userRole }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control EditCustomerOrderModal visibility

  useEffect(() => {
    const fetchDetails = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (order.SALES_ORDER_ID) {
        setLoading(true);
        setError(null);
        try {
          console.log(`Fetching details for Order ID: ${order.SALES_ORDER_ID}`);
          const details = await fetchOrderDetailsById(
            order.SALES_ORDER_ID,
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

  // Function to format date
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
    (total, detail) => total + (detail.SALES_ORDER_DET_PROD_LINE_QTY || 0),
    0
  );

  // Handlers for the buttons
  const handleAcceptOrder = async () => {
    const newDelivery = {
      SALES_ORDER_ID: order.SALES_ORDER_ID,
      OUTBOUND_DEL_CUSTOMER_NAME: order.SALES_ORDER_CLIENT_NAME,
      OUTBOUND_DEL_DLVRY_OPTION: order.SALES_ORDER_DLVRY_OPTION,
      OUTBOUND_DEL_CITY: order.SALES_ORDER_CLIENT_CITY,
      OUTBOUND_DEL_PROVINCE: order.SALES_ORDER_CLIENT_PROVINCE,
      OUTBOUND_DEL_ACCPTD_BY_USER: localStorage.getItem("user_first_name"),

      details: orderDetails.map((detail) => ({
        OUTBOUND_DETAILS_PROD_NAME: detail.SALES_ORDER_PROD_NAME,
        OUTBOUND_DETAILS_PROD_QTY: detail.SALES_ORDER_LINE_QTY,
        OUTBOUND_DETAILS_SELL_PRICE: detail.SALES_ORDER_LINE_PRICE,
      })),
    };

    try {
      const response = await addNewCustomerDelivery(newDelivery);
      logAcceptOrder(newOrderDelivery);
      if (response) {
        console.log("New outbound delivery created:", response);
        alert("Outbound delivery accepted successfully!");
      } else {
        alert("Failed to accept the outbound delivery.");
      }
    } catch (error) {
      console.error("Error accepting the order:", error);
      alert("An error occurred while accepting the order.");
    } finally {
      onClose();
    }
  };

  const handleCancelOrder = () => {
    // Logic to cancel the order
    console.log("Customer order cancelled");
    onClose(); // Close modal after action
  };

  const logAcceptOrder = async (newOrderDelivery) => {
    const userId = localStorage.getItem("user_id"); // Ensure "user_id" is correctly stored in localStorage
    console.log("User ID:", userId);
    try {
      // Fetch the user details using the userId
      const userResponse = await fetch(`http://127.0.0.1:8000/account/logs/${userId}/`);
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user details");
      }
  
      const user = await userResponse.json(); // Assuming the response contains the user object
      const username = user.username;
      
      const salesId = newOrderDelivery.SALES_ORDER_ID;
      // Construct the log payload
      const logPayload = {
        LLOG_TYPE: "Transaction logs",
        LOG_DESCRIPTION: `${username} accepted the customer order ID: (${salesId})`,
        USER_ID: userId,
      };
  
      // Send the log payload
      const logResponse = await fetch("http://127.0.0.1:8000/logs/logs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logPayload),
      });
  
      if (logResponse.ok) {
        console.log("Order log successfully created:", logPayload);
      } else {
        console.error("Failed to create order log:", logResponse);
      }
    } catch (error) {
      console.error("Error logging order acceptance:", error);
    }
  };

  const handleUpdateOrder = () => {
    // Trigger EditCustomerOrderModal to update order details
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Modal
        title="Customer Order Details"
        status={order.SALES_ORDER_STATUS}
        completedDate={order.SALES_ORDER_DATE}
        onClose={onClose}
      >
        <Section>
          <p>
            <strong>Order ID:</strong> {order.SALES_ORDER_ID}
          </p>
          <p>
            <strong>Order Created Date:</strong>{" "}
            {formatDate(order.SALES_ORDER_DATE_CREATED)}
          </p>
          <p>
            <strong>Customer ID:</strong> {order.SALES_ORDER_SUPPLIER_ID}
          </p>{" "}
          <p>
            <strong>Customer Name:</strong>{" "}
            {order.SALES_ORDER_SUPPLIER_CMPNY_NAME}
          </p>
        </Section>

        <Section>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Product Name</TableHeader>
                  <TableHeader>Quantity</TableHeader>
                  <TableHeader>Purchase Price</TableHeader>
                  <TableHeader>Sell Price</TableHeader>
                  <TableHeader>Discount (%)</TableHeader>
                  <TableHeader>Total</TableHeader>
                </tr>
              </thead>
              <tbody>
                {orderDetails.length > 0 ? (
                  orderDetails.map((detail) => {
                    const quantity = detail.SALES_ORDER_DET_PROD_LINE_QTY || 0;
                    const purchasePrice =
                      parseFloat(detail.SALES_ORDER_DET_PROD_SALES_PRICE) || 0;
                    const sellPrice =
                      parseFloat(detail.SALES_ORDER_DET_PROD_SELL_PRICE) || 0;
                    const discount =
                      parseFloat(detail.SALES_ORDER_DET_PROD_DISCOUNT) || 0;

                    // Calculate total per row: (Sell Price * Quantity) - Discount Amount
                    const discountValue =
                      (discount / 100) * sellPrice * quantity;
                    const total = sellPrice * quantity - discountValue;

                    return (
                      <TableRow key={detail.SALES_ORDER_DET_ID}>
                        <TableCell>
                          {detail.SALES_ORDER_DET_PROD_NAME}
                        </TableCell>
                        <TableCell>{quantity}</TableCell>
                        <TableCell>₱{purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>₱{sellPrice.toFixed(2)}</TableCell>
                        <TableCell>{discount.toFixed(2)}%</TableCell>
                        <TableCell>₱{total.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      No order details available.
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </TableWrapper>

          {/* Total Summary */}
          <TotalSection>
            <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
              <TotalLabel>Total Qty: </TotalLabel>
              <TotalValue>
                {orderDetails.reduce(
                  (acc, detail) =>
                    acc +
                    (parseInt(detail.SALES_ORDER_DET_PROD_LINE_QTY, 10) || 0),
                  0
                )}
              </TotalValue>
            </TotalRow>

            {/* Total Discount */}
            <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
              <TotalLabel>Total Discount: </TotalLabel>
              <TotalValue>
                ₱
                {orderDetails
                  .reduce((acc, detail) => {
                    const discountValue =
                      (((parseFloat(detail.SALES_ORDER_DET_PROD_SELL_PRICE) ||
                        0) *
                        (parseFloat(detail.SALES_ORDER_DET_PROD_DISCOUNT) ||
                          0)) /
                        100) *
                      (parseInt(detail.SALES_ORDER_DET_PROD_LINE_QTY, 10) || 0);
                    return acc + discountValue;
                  }, 0)
                  .toFixed(2)}
              </TotalValue>
            </TotalRow>

            {/* Total Revenue */}
            <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
              <TotalLabel>Total Revenue: </TotalLabel>
              <TotalValue style={{ color: "#f08400" }}>
                ₱
                {orderDetails
                  .reduce((acc, detail) => {
                    const totalRevenue =
                      (parseFloat(detail.SALES_ORDER_DET_PROD_SELL_PRICE) ||
                        0) *
                      (parseInt(detail.SALES_ORDER_DET_PROD_LINE_QTY, 10) || 0);
                    return acc + totalRevenue;
                  }, 0)
                  .toFixed(2)}
              </TotalValue>
            </TotalRow>

            {/* Total Cost */}
            <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
              <TotalLabel>Total Cost: </TotalLabel>
              <TotalValue style={{ color: "#ff5757" }}>
                ₱
                {orderDetails
                  .reduce((acc, detail) => {
                    const totalCost =
                      (parseFloat(detail.SALES_ORDER_DET_PROD_SALES_PRICE) ||
                        0) *
                      (parseInt(detail.SALES_ORDER_DET_PROD_LINE_QTY, 10) || 0);
                    return acc + totalCost;
                  }, 0)
                  .toFixed(2)}
              </TotalValue>
            </TotalRow>

            {/* Gross Profit */}
            <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
              <TotalLabel>Gross Profit: </TotalLabel>
              <TotalValue style={{ color: "#1DBA0B" }}>
                ₱
                {(
                  orderDetails.reduce((acc, detail) => {
                    const totalRevenue =
                      (parseFloat(detail.SALES_ORDER_DET_PROD_SELL_PRICE) ||
                        0) *
                      (parseInt(detail.SALES_ORDER_DET_PROD_LINE_QTY, 10) || 0);
                    return acc + totalRevenue;
                  }, 0) -
                  orderDetails.reduce((acc, detail) => {
                    const totalCost =
                      (parseFloat(detail.SALES_ORDER_DET_PROD_SALES_PRICE) ||
                        0) *
                      (parseInt(detail.SALES_ORDER_DET_PROD_LINE_QTY, 10) || 0);
                    return acc + totalCost;
                  }, 0)
                ).toFixed(2)}
              </TotalValue>
            </TotalRow>
          </TotalSection>
        </Section>

        {order.SALES_ORDER_STATUS === "Pending" && (
          <ButtonGroup>
            <Button variant="red" onClick={handleCancelOrder}>
              Cancel Order
            </Button>
            <Button variant="green" onClick={handleUpdateOrder}>
              Update Order
            </Button>
            <Button variant="primary" onClick={handleAcceptOrder}>
              Accept Order
            </Button>
          </ButtonGroup>
        )}
      </Modal>

      {/* Edit Customer Order Modal */}
      {isEditModalOpen && (
        <EditCustomerOrderModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => {
            setIsEditModalOpen(false);
            // Optionally, trigger some state update or refetch order details after saving
          }}
          supplierOrderData={order} // Pass the order data to edit
        />
      )}
    </>
  );
};

// Styled Components
const Section = styled.div`
  margin-bottom: 20px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
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

export default CustomerOrderDetailsModal;

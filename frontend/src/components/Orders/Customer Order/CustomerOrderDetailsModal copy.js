import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Assuming you have a modal component
import { colors } from "../../../colors"; // Ensure the path to colors is correct
import Button from "../../Layout/Button"; // Ensure you import the Button component
import { fetchPurchaseDetailsById } from "../../../api/fetchPurchaseOrders";
import { addNewSupplierDelivery } from "../../../api/SupplierDeliveryApi";
import EditSupplierOrderModal from "./EditSupplierOrderModal"; // Importing the EditSupplierOrderModal
import {
  Table,
  TotalSection,
  TotalRow,
  TotalLabel,
  TotalValue,
  ButtonGroup,
} from "../OrderStyles";

const SupplierOrderDetailsModal = ({ order, onClose, userRole }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control EditSupplierOrderModal visibility

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
    (total, detail) => total + (detail.PURCHASE_ORDER_DET_PROD_LINE_QTY || 0),
    0
  );

  // Handlers for the buttons
  const handleAcceptOrder = async () => {
    const newDelivery = {
      PURCHASE_ORDER_ID: order.PURCHASE_ORDER_ID,
      INBOUND_DEL_SUPP_ID: order.PURCHASE_ORDER_SUPPLIER_ID,
      INBOUND_DEL_SUPP_NAME: order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME,
      INBOUND_DEL_TOTAL_ORDERED_QTY: totalQuantity,
      INBOUND_DEL_ORDER_APPRVDBY_USER: localStorage.getItem("user_first_name"),

      details: orderDetails.map((detail) => ({
        INBOUND_DEL_DETAIL_PROD_ID: detail.PURCHASE_ORDER_DET_PROD_ID,
        INBOUND_DEL_DETAIL_PROD_NAME: detail.PURCHASE_ORDER_DET_PROD_NAME,
        INBOUND_DEL_DETAIL_ORDERED_QTY: detail.PURCHASE_ORDER_DET_PROD_LINE_QTY,
      })),
    };

    try {
      const response = await addNewSupplierDelivery(newDelivery);
      if (response) {
        console.log("New inbound delivery created:", response);
        alert("Inbound delivery accepted successfully!");
      } else {
        alert("Failed to accept the inbound delivery.");
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
    console.log("Supplier order cancelled");
    onClose(); // Close modal after action
  };

  const handleUpdateOrder = () => {
    // Trigger EditSupplierOrderModal to update order details
    setIsEditModalOpen(true);
  };

  return (
    <>
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
          <p>
            <strong>Supplier Name:</strong>{" "}
            {order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME}
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
                    const quantity =
                      detail.PURCHASE_ORDER_DET_PROD_LINE_QTY || 0;
                    const purchasePrice =
                      parseFloat(
                        detail.PURCHASE_ORDER_DET_PROD_PURCHASE_PRICE
                      ) || 0;
                    const sellPrice =
                      parseFloat(detail.PURCHASE_ORDER_DET_PROD_SELL_PRICE) ||
                      0;
                    const discount =
                      parseFloat(detail.PURCHASE_ORDER_DET_PROD_DISCOUNT) || 0;

                    // Calculate total per row: (Sell Price * Quantity) - Discount Amount
                    const discountValue =
                      (discount / 100) * sellPrice * quantity;
                    const total = sellPrice * quantity - discountValue;

                    return (
                      <TableRow key={detail.PURCHASE_ORDER_DET_ID}>
                        <TableCell>
                          {detail.PURCHASE_ORDER_DET_PROD_NAME}
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
                    (parseInt(detail.PURCHASE_ORDER_DET_PROD_LINE_QTY, 10) ||
                      0),
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
                      (((parseFloat(
                        detail.PURCHASE_ORDER_DET_PROD_SELL_PRICE
                      ) || 0) *
                        (parseFloat(detail.PURCHASE_ORDER_DET_PROD_DISCOUNT) ||
                          0)) /
                        100) *
                      (parseInt(detail.PURCHASE_ORDER_DET_PROD_LINE_QTY, 10) ||
                        0);
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
                      (parseFloat(detail.PURCHASE_ORDER_DET_PROD_SELL_PRICE) ||
                        0) *
                      (parseInt(detail.PURCHASE_ORDER_DET_PROD_LINE_QTY, 10) ||
                        0);
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
                      (parseFloat(
                        detail.PURCHASE_ORDER_DET_PROD_PURCHASE_PRICE
                      ) || 0) *
                      (parseInt(detail.PURCHASE_ORDER_DET_PROD_LINE_QTY, 10) ||
                        0);
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
                      (parseFloat(detail.PURCHASE_ORDER_DET_PROD_SELL_PRICE) ||
                        0) *
                      (parseInt(detail.PURCHASE_ORDER_DET_PROD_LINE_QTY, 10) ||
                        0);
                    return acc + totalRevenue;
                  }, 0) -
                  orderDetails.reduce((acc, detail) => {
                    const totalCost =
                      (parseFloat(
                        detail.PURCHASE_ORDER_DET_PROD_PURCHASE_PRICE
                      ) || 0) *
                      (parseInt(detail.PURCHASE_ORDER_DET_PROD_LINE_QTY, 10) ||
                        0);
                    return acc + totalCost;
                  }, 0)
                ).toFixed(2)}
              </TotalValue>
            </TotalRow>
          </TotalSection>
        </Section>

        {order.PURCHASE_ORDER_STATUS === "Pending" && (
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

      {/* Edit Supplier Order Modal */}
      {isEditModalOpen && (
        <EditSupplierOrderModal
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

export default SupplierOrderDetailsModal;

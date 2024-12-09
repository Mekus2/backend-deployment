import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button"; // Ensure you import the Button component
import EditCustomerOrderModal from "./EditCustomerOrderModal"; // Import the Edit Modal
import { fetchOrderDetailsById } from "../../../api/fetchCustomerOrders";
import { addNewCustomerDelivery } from "../../../api/CustomerDeliveryApi";
import {
  Table,
  TableWrapper,
  TableHeader,
  TableRow,
  TableCell,
  Section,
  TotalSummary,
  TotalItem,
  HighlightedTotal,
  ButtonGroup,
} from "../OrderStyles";

const CustomerOrderDetailsModal = ({ order, onClose, userRole }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const userId = localStorage.getItem("user_id");

  const handleUpdateOrder = () => {
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false); // Close the edit modal
  };

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
          const details = await fetchOrderDetailsById(
            order.SALES_ORDER_ID,
            controller.signal
          );
          setOrderDetails(details);
        } catch (err) {
          if (err.name === "AbortError") {
            console.log("Fetch aborted");
          } else {
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

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return "₱0.00";
    }
    return `₱${numericAmount.toFixed(2)}`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!orderDetails) return null;
  if (!order) return null;

  const totalQuantity = orderDetails.reduce(
    (total, detail) => total + (detail.SALES_ORDER_LINE_QTY || 0),
    0
  );

  const calculateLineTotal = (line) => {
    const price = parseFloat(line.SALES_ORDER_LINE_PRICE) || 0;
    const quantity = parseInt(line.SALES_ORDER_LINE_QTY) || 0;
    const discount = parseFloat(line.SALES_ORDER_LINE_DISCOUNT) || 0;

    // Calculate total: (Qty * Price) - (Qty * Price * Discount)
    const total = price * quantity * (1 - discount / 100);
    return total.toFixed(2); // Ensure it's returned as a string with two decimals
  };

  const totalAmount = orderDetails.reduce((total, detail) => {
    const lineTotal = calculateLineTotal(detail);
    return total + parseFloat(lineTotal);
  }, 0);

  const totalDiscount = orderDetails.reduce(
    (total, detail) =>
      total +
      (parseFloat(detail.SALES_ORDER_LINE_PRICE) *
        parseInt(detail.SALES_ORDER_LINE_QTY) *
        (parseFloat(detail.SALES_ORDER_LINE_DISCOUNT) / 100) || 0),
    0
  );

  const handleAcceptOrder = async () => {
    const newDelivery = {
      SALES_ORDER_ID: order.SALES_ORDER_ID,
      CLIENT_ID: order.CLIENT_ID,
      OUTBOUND_DEL_CUSTOMER_NAME: order.SALES_ORDER_CLIENT_NAME,
      OUTBOUND_DEL_DLVRY_OPTION: order.SALES_ORDER_DLVRY_OPTION,
      OUTBOUND_DEL_TOTAL_PRICE: order.SALES_ORDER_TOTAL_PRICE,
      OUTBOUND_DEL_CITY: order.SALES_ORDER_CLIENT_CITY,
      OUTBOUND_DEL_PROVINCE: order.SALES_ORDER_CLIENT_PROVINCE,
      OUTBOUND_DEL_ACCPTD_BY_USERNAME: localStorage.getItem("user_first_name"),
      OUTBOUND_DEL_ACCPTD_BY_USER: userId,
      details: orderDetails.map((detail) => ({
        OUTBOUND_DETAILS_PROD_ID: detail.SALES_ORDER_PROD_ID,
        OUTBOUND_DETAILS_PROD_NAME: detail.SALES_ORDER_PROD_NAME,
        OUTBOUND_DETAILS_PROD_QTY_ORDERED: detail.SALES_ORDER_LINE_QTY,
        OUTBOUND_DETAILS_LINE_DISCOUNT: detail.SALES_ORDER_LINE_DISCOUNT,
        OUTBOUND_DETAILS_SELL_PRICE: detail.SALES_ORDER_LINE_PRICE,
        OUTBOUND_DETAIL_LINE_TOTAL: detail.SALES_ORDER_LINE_TOTAL,
      })),
    };
    try {
      const response = await addNewCustomerDelivery(newDelivery);
      if (response) {
        alert("Customer delivery accepted");
      } else {
        alert("Customer delivery rejected");
      }
    } catch (err) {
      alert("An error occurred while accepting the order.");
    } finally {
      onClose();
      window.location.reload();
    }
  };

  const handleCancelOrder = () => {
    console.log("Order cancelled");
    onClose();
  };

  return (
    <>
      <Modal
        title="Customer Order Details"
        status={order.SALES_ORDER_STATUS}
        onClose={onClose}
      >
        <Section>
          <p>
            <strong>Order ID: </strong> {order.SALES_ORDER_ID}
          </p>
          <p>
            <strong>Order Created Date:</strong>{" "}
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
          <p>
            <strong>Delivery Option:</strong> {order.SALES_ORDER_DLVRY_OPTION}
          </p>
          <p>
            <strong>Client:</strong> {order.SALES_ORDER_CLIENT_NAME}
          </p>
          <p>
            <strong>City:</strong> {order.SALES_ORDER_CLIENT_CITY}
          </p>
          <p>
            <strong>Province:</strong> {order.SALES_ORDER_CLIENT_PROVINCE}
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
                  <TableHeader>Discount</TableHeader>
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
                        {formatCurrency(
                          detail.SALES_ORDER_LINE_PURCHASE_PRICE || 0
                        )}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(detail.SALES_ORDER_LINE_PRICE || 0)}
                      </TableCell>
                      <TableCell>{`${
                        detail.SALES_ORDER_LINE_DISCOUNT || "0"
                      }%`}</TableCell>
                      <TableCell>
                        {formatCurrency(detail.SALES_ORDER_LINE_TOTAL || 0)}
                      </TableCell>
                    </TableRow>
                  ))
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
        </Section>

        <TotalSummary>
          <TotalItem>
            <strong>Total Quantity:</strong> {totalQuantity}
          </TotalItem>
          <TotalItem>
            <strong>Total Discount:</strong> {formatCurrency(totalDiscount)}
          </TotalItem>
          <HighlightedTotal>
            <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
          </HighlightedTotal>
        </TotalSummary>

        <ButtonGroup>
          <Button variant="red" onClick={handleCancelOrder}>
            Cancel Order
          </Button>
          {userRole !== "staff" && (
            <Button variant="green" onClick={handleUpdateOrder}>
              Update Order
            </Button>
          )}
          <Button variant="primary" onClick={handleAcceptOrder}>
            Accept Order
          </Button>
        </ButtonGroup>
      </Modal>

      {isEditModalOpen && (
        <EditCustomerOrderModal order={order} onClose={handleCloseEditModal} />
      )}
    </>
  );
};

export default CustomerOrderDetailsModal;

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Assuming you have a modal component
import { colors } from "../../../colors"; // Ensure the path to colors is correct
import Button from "../../Layout/Button"; // Ensure you import the Button component
import { fetchPurchaseDetailsById } from "../../../api/fetchPurchaseOrders";
import { addNewSupplierDelivery } from "../../../api/SupplierDeliveryApi";
import EditSupplierOrderModal from "./EditSupplierOrderModal"; // Importing the EditSupplierOrderModal

const SupplierOrderDetailsModal = ({ order, onClose, userRole }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to control EditSupplierOrderModal visibility
  const [isEditMode, setIsEditMode] = useState(false); // State to toggle Edit Mode

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
          const details = await fetchPurchaseDetailsById(
            order.PURCHASE_ORDER_ID,
            controller.signal
          );
          setOrderDetails(details);
        } catch (err) {
          if (err.name !== "AbortError") {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date)
      ? ""
      : `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
          .getDate()
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const totalQuantity = orderDetails.reduce(
    (total, detail) => total + (detail.PURCHASE_ORDER_DET_PROD_LINE_QTY || 0),
    0
  );

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
        INBOUND_DEL_DETAIL_ORDERED_QTY:
          detail.PURCHASE_ORDER_DET_PROD_LINE_QTY,
      })),
    };

    try {
      const response = await addNewSupplierDelivery(newDelivery);
      if (response) {
        alert("Inbound delivery accepted successfully!");
      } else {
        alert("Failed to accept the inbound delivery.");
      }
    } catch (error) {
      alert("An error occurred while accepting the order.");
    } finally {
      onClose();
    }
  };

  const handleCancelOrder = () => {
    console.log("Supplier order cancelled");
    onClose(); // Close modal after action
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev); // Toggle the edit mode
  };

  const handleInputChange = (index, key, value) => {
    const updatedDetails = [...orderDetails];
    updatedDetails[index][key] = value;
    setOrderDetails(updatedDetails);
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
          </p>
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
                </tr>
              </thead>
              <tbody>
                {orderDetails.length > 0 ? (
                  orderDetails.map((detail, index) => (
                    <TableRow key={detail.PURCHASE_ORDER_DET_ID}>
                      <TableCell>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={detail.PURCHASE_ORDER_DET_PROD_NAME}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "PURCHASE_ORDER_DET_PROD_NAME",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          detail.PURCHASE_ORDER_DET_PROD_NAME
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditMode ? (
                          <input
                            type="number"
                            value={detail.PURCHASE_ORDER_DET_PROD_LINE_QTY}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "PURCHASE_ORDER_DET_PROD_LINE_QTY",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          detail.PURCHASE_ORDER_DET_PROD_LINE_QTY || 0
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2}>No order details available.</TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </TableWrapper>
          <TotalSummary>
            <SummaryItem>
              <strong>Total Quantity:</strong> {totalQuantity}
            </SummaryItem>
          </TotalSummary>
        </Section>
        {order.PURCHASE_ORDER_STATUS === "Pending" && (
          <ButtonGroup>
            <Button variant="red" onClick={handleCancelOrder}>
              Cancel Order
            </Button>
            <Button variant="green" onClick={toggleEditMode}>
              {isEditMode ? "Save Changes" : "Update Order"}
            </Button>
            <Button variant="primary" onClick={handleAcceptOrder}>
              Accept Order
            </Button>
          </ButtonGroup>
        )}
      </Modal>
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
  flex-direction: column;
  align-items: flex-end;
  margin-top: 20px;
  font-weight: bold;
`;

const SummaryItem = styled.div`
  margin-top: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;

export default SupplierOrderDetailsModal;

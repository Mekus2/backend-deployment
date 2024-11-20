import React from "react";
import styled from "styled-components";
import Modal from "../Layout/Modal";
import { colors } from "../../colors"; // Ensure the path to colors is correct

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatCurrency = (amount) => `₱${amount.toFixed(2)}`;

  // Calculate totals with checks to ensure properties exist and are arrays
  const orderDetails =
    order.ORDER_REQUEST_DETAILS || order.SALES_ORDER_DETAILS || [];

  const totalQuantity = orderDetails.reduce(
    (total, detail) =>
      total + (detail.ORDER_REQ_QTY || detail.SALES_ORDER_QTY || 0),
    0
  );

  const totalAmount = orderDetails.reduce(
    (total, detail) =>
      total +
      (detail.ORDER_REQ_LINE_TOTAL || detail.SALES_ORDER_LINE_TOTAL || 0),
    0
  );

  return (
    <Modal
      title="Order Details"
      status={order.ORDER_STATUS}
      completedDate={order.ORDER_DATEUPDATED}
      onClose={onClose}
    >
      <Section>
        <p>
          <strong>Order Date:</strong> {order.ORDER_DATACREATED}
        </p>
        <p>
          <strong>Order Type:</strong> {order.ORDER_TYPE}
        </p>
        {order.ORDER_TYPE === "PURCHASE ORDER" ? (
          <>
            <p>
              <strong>Supplier Order Date:</strong> {order.ORDER_DATEUPDATED}
            </p>
            <p>
              <strong>Total Quantity:</strong> {totalQuantity}
            </p>
            <p>
              <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
            </p>
            <p>
              <strong>Supplier ID:</strong> {order.SUPPLIER_ID}
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>Customer Order Date:</strong>{" "}
              {order.SALES_ORDER_DATACREATED}
            </p>
            <p>
              <strong>Delivery Date:</strong> {order.SALES_ORDER_DLVRY_DATE}
            </p>
            <p>
              <strong>Total Quantity:</strong> {totalQuantity}
            </p>
            <p>
              <strong>Total Amount:</strong> {formatCurrency(totalAmount)}
            </p>
            <p>
              <strong>Discount:</strong>{" "}
              {formatCurrency(order.SALES_ORDER_DISCOUNT)}
            </p>
            <p>
              <strong>Delivery Option:</strong> {order.SALES_ORDER_DLVRY_OPT}
            </p>
            <p>
              <strong>Client ID:</strong> {order.CLIENT_ID}
            </p>
          </>
        )}
      </Section>
      <Section>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Product Name</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Total</TableHeader>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {detail.ORDER_REQ_PRODUCT_NAME ||
                      detail.SALES_ORDER_PROD_NAME}
                  </TableCell>
                  <TableCell>
                    {detail.ORDER_REQ_DESCRIPTION ||
                      detail.SALES_ORDER_DESCRIPTION ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    {detail.ORDER_REQ_QTY || detail.SALES_ORDER_QTY}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      detail.ORDER_REQ_PRICE || detail.SALES_ORDER_PRICE
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      detail.ORDER_REQ_LINE_TOTAL ||
                        detail.SALES_ORDER_LINE_TOTAL
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
        <TotalSummary>
          <p>
            <strong>Total Quantity:</strong> {totalQuantity}
          </p>
          <p>
            <strong>Total Amount:</strong>{" "}
            <HighlightedTotal>{formatCurrency(totalAmount)}</HighlightedTotal>
          </p>
        </TotalSummary>
      </Section>
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
  margin-top: 20px;
  text-align: right;
`;

const HighlightedTotal = styled.span`
  color: green;
  font-weight: bold;
  font-size: 16px;
`;

export default OrderDetailsModal;

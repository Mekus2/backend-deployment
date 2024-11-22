import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Import the existing Modal component
import Button from "../../Layout/Button"; // Import the Button component
import { colors } from "../../../colors";

const IssueDetails = ({ orderDetails, onClose, onSubmit }) => {
  // Initialize updatedOrderDetails to an empty array if orderDetails is undefined
  const [updatedOrderDetails, setUpdatedOrderDetails] = useState(orderDetails || []);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    // Ensure updatedOrderDetails gets updated if orderDetails prop changes
    setUpdatedOrderDetails(orderDetails || []);
  }, [orderDetails]);

  const handleQuantityChange = (index, value) => {
    const newOrderDetails = [...updatedOrderDetails];
    const availableQuantity = newOrderDetails[index].OUTBOUND_DETAILS_PROD_QTY;

    if (value <= availableQuantity && value >= 0) {
      newOrderDetails[index].updatedQuantity = value;
      setUpdatedOrderDetails(newOrderDetails);
    } else {
      alert("Quantity must not exceed the shipped quantity and cannot be negative.");
    }
  };

  const handleSubmit = () => {
    if (remarks.trim() === "") {
      alert("Please provide a description of the issue.");
      return;
    }

    const validQuantities = updatedOrderDetails.every(item => item.updatedQuantity <= item.OUTBOUND_DETAILS_PROD_QTY && item.updatedQuantity >= 0);
    if (!validQuantities) {
      alert("Some quantities are invalid. Please check and try again.");
      return;
    }

    onSubmit(updatedOrderDetails, remarks);
  };

  return (
    <Modal data-cy="customer-issue-modal" title="Issue Details" onClose={onClose}>
      {/* Remarks Section */}
      <RemarksLabel>Description of the Issue:</RemarksLabel>
      <RemarksTextArea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        rows="4"
        placeholder="Describe the issue with the product"
      />

      {/* Product Table */}
      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Quantity Shipped</TableHeader>
            <TableHeader>Updated Quantity</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Total</TableHeader>
          </tr>
        </thead>
        <tbody>
          {updatedOrderDetails.length > 0 ? (
            updatedOrderDetails.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.OUTBOUND_DETAILS_PROD_NAME}</TableCell>
                <TableCell>{item.OUTBOUND_DETAILS_PROD_QTY}</TableCell>
                <TableCell>
                  <QuantityInput
                    type="number"
                    value={item.updatedQuantity || 0}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    min="0"
                    max={item.OUTBOUND_DETAILS_PROD_QTY}
                  />
                </TableCell>
                <TableCell>
                  ₱{(Number(item.OUTBOUND_DETAILS_LINE_PRICE) || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  ₱{(item.updatedQuantity || 0) * Number(item.OUTBOUND_DETAILS_LINE_PRICE).toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan="5">No products available</TableCell>
            </TableRow>
          )}
        </tbody>
      </ProductTable>

      {/* Button Group for Cancel and Edit (formerly Submit) */}
      <ButtonGroup>
        <Button variant="red" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Edit Issue
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

// Styled Components
const RemarksLabel = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const RemarksTextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
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
  text-align: center; /* Centering content */
`;

const QuantityInput = styled.input`
  width: 60px;
  text-align: center;
  padding: 5px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

export default IssueDetails;

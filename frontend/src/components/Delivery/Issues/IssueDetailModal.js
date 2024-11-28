import React from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Reusable Modal component
import { colors } from "../../../colors";
import Button from "../../Layout/Button"; // Import Button component

// Utility function to format numbers as currency
const formatCurrency = (amount) => {
  return `₱${amount.toFixed(2)}`;
};

const IssueDetailModal = ({ issue = {}, onClose, onCancelIssue, onChangeStatus }) => {
  // Calculate the total defect amount (defect quantity * price for each product)
  const calculateTotalDefectAmount = () => {
    if (!issue.PRODUCTS) return 0;
    return issue.PRODUCTS.reduce(
      (sum, product) => sum + (product.defectQuantity * product.price),
      0
    );
  };

  // Calculate the total order value (qty ordered + defect qty) * price
  const calculateTotalOrderValue = () => {
    if (!issue.PRODUCTS) return 0;
    return issue.PRODUCTS.reduce(
      (sum, product) => sum + ((product.quantity + product.defectQuantity) * product.price),
      0
    );
  };

  return (
    <Modal
      title="Issue Details"
      status={issue.RESOLUTION_STATUS}
      completedDate={issue.REPORTED_DATE}
      onClose={onClose}
    >
      <DetailsContainer>
        <Column align="left">
          <FormGroup>
            <Label>Customer Name:</Label>
            <Value>{issue.CUSTOMER_NAME || "N/A"}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Issue Type:</Label>
            <Value>{issue.ISSUE_TYPE || ""}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Reported Date:</Label>
            <Value>{issue.REPORTED_DATE || ""}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Resolution Status:</Label>
            <Value>{issue.RESOLUTION_STATUS || ""}</Value>
          </FormGroup>
        </Column>
      </DetailsContainer>

      <FormGroup>
        <DescriptionBox>
          <p>{issue.ISSUE_DESCRIPTION || "No description available."}</p>
        </DescriptionBox>
      </FormGroup>

      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Qty Ordered</TableHeader>
            <TableHeader>Qty Defect</TableHeader>
            <TableHeader>Price</TableHeader>
          </tr>
        </thead>
        <tbody>
          {(issue.PRODUCTS || []).map((product, index) => (
            <TableRow key={index}>
              <TableCell>{product.productName || ""}</TableCell>
              <TableCell>{product.quantity || 0}</TableCell>
              <TableCell>{product.defectQuantity || 0}</TableCell>
              <TableCell>{formatCurrency(product.price || 0)}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Only apply flex-end to the totals section below the table */}
      <SummarySection>
        <FormGroup>
          <Label style={{ display: "flex", alignItems: "left", marginLeft: "690px" }}>Total Defect Amount:</Label>
          <Value>{formatCurrency(calculateTotalDefectAmount())}</Value>
        </FormGroup>
        <FormGroup>
          <Label style={{ display: "flex", alignItems: "left", marginLeft: "690px" }}>Total Order Value:</Label>
          <Value>{formatCurrency(calculateTotalOrderValue())}</Value>
        </FormGroup>
      </SummarySection>

      {/* Button group to change the issue status */}
      <ActionsContainer>
        <Button
          bgColor="#FF9800" // Orange for "Offset Product"
          onClick={() => onChangeStatus(issue.ISSUE_ID, "Offset Product")}
        >
          Offset Product
        </Button>
        <Button
          bgColor="#4CAF50" // Green for "Replaced"
          onClick={() => onChangeStatus(issue.ISSUE_ID, "Replaced Product")}
        >
          Product Replaced
        </Button>
      </ActionsContainer>
    </Modal>
  );
};

// Styled components
const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Column = styled.div`
  width: 48%;
  text-align: ${(props) => props.align || "left"};
`;

const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  width: 100%; /* Ensure full width for aligning */
  label {
    text-align: right; /* Align label to the right */
    width: 30%; /* Optional: Adjust width for label */
  }
`;

const Label = styled.div`
  font-weight: bold;
  color: black;
  text-align: right; /* Align text to the right */
`;

const Value = styled.div`
  color: ${colors.text};
  text-align: left; /* Ensure values are left-aligned */
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-top: 15px;
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
`;

// Only align the total section to the right
const SummarySection = styled.div`
  margin-top: 20px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;  // Align all children to the right
`;

const DescriptionBox = styled.div`
  border: 1px solid #3b3b3bf7;
  border-radius: 4px;
  padding: 10px;
  max-height: 100px;
  overflow-y: auto;
  width: 100%;
  text-align: left;
  background: #f9f9f9;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end; // Align buttons to the right
  margin-top: 20px;
  gap: 10px; // Add spacing between buttons
`;

export default IssueDetailModal;

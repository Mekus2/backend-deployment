import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import { colors } from "../../../colors";

const SupplierCreateIssue = ({ orderDetails, onClose, onSubmit }) => {
  const [updatedOrderDetails, setUpdatedOrderDetails] = useState(orderDetails);
  const [remarks, setRemarks] = useState("");
  const [issueType, setIssueType] = useState("");
  const [qtyAccepted, setQtyAccepted] = useState([]);

  // Initialize qtyAccepted state based on the orderDetails length
  useEffect(() => {
    if (orderDetails && orderDetails.length > 0) {
      setQtyAccepted(orderDetails.map(() => 0)); // Initialize qtyAccepted with 0 for each item
    }
  }, [orderDetails]); // Dependency on orderDetails

  const handleQtyAcceptedChange = (index, value) => {
    const newQtyAccepted = [...qtyAccepted];
    newQtyAccepted[index] = value;
    setQtyAccepted(newQtyAccepted);
  };

  const handleSubmit = () => {
    if (issueType.trim() === "") {
      alert("Please select the type of issue.");
      return;
    }

    if (remarks.trim() === "") {
      alert("Please provide a description of the issue.");
      return;
    }

    const validQuantities = updatedOrderDetails.every(
      (item, index) =>
        qtyAccepted[index] <= item.INBOUND_DEL_DETAIL_LINE_QTY &&
        qtyAccepted[index] >= 0
    );
    if (!validQuantities) {
      alert("Some quantities are invalid. Please check and try again.");
      return;
    }

    onSubmit(updatedOrderDetails, remarks, issueType); // Pass issueType in onSubmit
  };

  const calculateItemTotal = (qty, price) => {
    return qty * price;
  };

  const calculateTotalDefectAmount = () => {
    return updatedOrderDetails.reduce(
      (sum, item, index) => sum + (qtyAccepted[index] * item.INBOUND_DEL_DETAIL_LINE_PRICE),
      0
    );
  };

  const calculateTotalOrderValue = () => {
    return updatedOrderDetails.reduce(
      (sum, item) => sum + (item.INBOUND_DEL_DETAIL_ORDERED_QTY * item.INBOUND_DEL_DETAIL_LINE_PRICE),
      0
    );
  };

  return (
    <Modal
      data-cy="supplier-create-issue-modal"
      title="Report a Supplier Orders Issue"
      onClose={onClose}
    >
      <Label htmlFor="issue-type">Type of Issue:</Label>
      <Select
        id="issue-type"
        value={issueType}
        onChange={(e) => setIssueType(e.target.value)}
      >
        <option value="Damaged Product">Damaged Product</option>
        <option value="Missing Items">Missing Items</option>
        <option value="Incorrect Product">Incorrect Product</option>
        <option value="Expired Product">Expired Product</option>
        <option value="Defective Product">Defective Product</option>
        <option value="Wrong Quantity">Wrong Quantity</option>
        <option value="Packaging Issues">Packaging Issues</option>
        <option value="Other">Other</option>
      </Select>

      <RemarksLabel>Description of the Issue:</RemarksLabel>
      <RemarksTextArea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        rows="4"
        placeholder="Describe the issue with the product"
      />

      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Qty Ordered</TableHeader>
            <TableHeader>Qty Accepted</TableHeader>
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
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "textfield",
                  }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  value={item.INBOUND_DEL_DETAIL_LINE_PRICE || ""}
                  min="0"
                  onChange={(e) => {
                    const newPrice = parseFloat(e.target.value);
                    if (isNaN(newPrice) || newPrice < 0) {
                      return;
                    }
                    const updatedOrderDetails = [...orderDetails];
                    updatedOrderDetails[index].INBOUND_DEL_DETAIL_LINE_PRICE =
                      newPrice;
                    setUpdatedOrderDetails(updatedOrderDetails);
                  }}
                  style={{
                    border: "1px solid #ccc",
                    padding: "5px",
                    borderRadius: "4px",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "textfield",
                  }}
                />
              </TableCell>

              <TableCell>
                ₱
                {calculateItemTotal(
                  qtyAccepted[index] ?? 0,
                  item.INBOUND_DEL_DETAIL_LINE_PRICE ?? 0
                ).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Summary Section - Right aligned */}
      <SummarySection>
        <FormGroup>
          <Label>Total Defect Amount:</Label>
          <Value>₱{calculateTotalDefectAmount().toFixed(2)}</Value>
        </FormGroup>
        <FormGroup>
          <Label>Total Order Value:</Label>
          <Value>₱{calculateTotalOrderValue().toFixed(2)}</Value>
        </FormGroup>
      </SummarySection>

      <ButtonGroup>
        <Button variant="red" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit Issue
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

// Styled Components (same as in your original code)
const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
`;

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
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const SummarySection = styled.div`
  margin-top: 20px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end; // Align the summary content to the right
`;

const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  width: 100%;
`;

const Value = styled.div`
  color: ${colors.text};
  text-align: left;
`;

export default SupplierCreateIssue;

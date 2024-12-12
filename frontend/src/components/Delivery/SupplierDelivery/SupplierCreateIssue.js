import React, { useState } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Import the existing Modal component
import Button from "../../Layout/Button"; // Import the Button component
import { colors } from "../../../colors";

const CustomerCreateIssueModal = ({ orderDetails, onClose, onSubmit }) => {
  const [updatedOrderDetails, setUpdatedOrderDetails] = useState(orderDetails);
  const [remarks, setRemarks] = useState("");
  const [issueType, setIssueType] = useState(""); // State to track selected issue type
  const [resolution, setResolution] = useState(""); // State to track selected resolution

  const handleQuantityChange = (index, value) => {
    const newOrderDetails = [...updatedOrderDetails];
    const availableQuantity =
      newOrderDetails[index].INBOUND_DEL_DETAIL_ORDERED_QTY;

    if (value <= availableQuantity && value >= 0) {
      newOrderDetails[index].updatedQuantity = value;
      setUpdatedOrderDetails(newOrderDetails);
    } else {
      alert(
        "Quantity must not exceed the shipped quantity and cannot be negative."
      );
    }
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

    // const validQuantities = updatedOrderDetails.every(
    //   (item) =>
    //     item.updatedQuantity <= item.INBOUND_DEL_DETAIL_ORDERED_QTY &&
    //     item.updatedQuantity >= 0
    // );
    // if (!validQuantities) {
    //   alert("Some quantities are invalid. Please check and try again.");
    //   return;
    // }

    onSubmit(updatedOrderDetails, remarks, issueType, resolution); // Pass resolution in onSubmit
  };

  return (
    <Modal
      data-cy="customer-issue-modal"
      title="Report Supplier Delivery Issue"
      onClose={onClose}
    >
      {/* Type of Issue Dropdown */}
      <Label htmlFor="issue-type">Type of Issue:</Label>
      <Select
        id="issue-type"
        value={issueType}
        onChange={(e) => setIssueType(e.target.value)}
      >
        <option value="" disabled>
          Select an issue type
        </option>
        <option value="Damaged">Damaged Product</option>
        <option value="Missing">Missing Items</option>
        <option value="Wrong Item">Incorrect Product</option>
        <option value="Expired ">Expired Product</option>
        <option value="Defective ">Defective Product</option>
        <option value="Other">Other</option>
      </Select>

      {/* Resolution Dropdown (Independent of Issue Type) */}
      <Label htmlFor="resolution">Resolution:</Label>
      <Select
        id="resolution"
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
      >
        <option value="" disabled>
          Select a resolution
        </option>
        <option value="Replacement">Reshipment</option>
        <option value="Offset">Offset Product</option>
        <option value="Other">Other</option>
      </Select>

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
            <TableHeader>Affected Qty</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Total</TableHeader>
          </tr>
        </thead>
        <tbody>
          {updatedOrderDetails.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.INBOUND_DEL_DETAIL_PROD_NAME}</TableCell>
              <TableCell>{item.INBOUND_DEL_DETAIL_ORDERED_QTY}</TableCell>
              <TableCell>{item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT}</TableCell>
              {/* <TableCell>
                <QuantityInput
                  type="number"
                  value={item.updatedQuantity || 0}
                  onChange={(e) =>
                    handleQuantityChange(index, parseInt(e.target.value))
                  }
                  min="0"
                  max={item.INBOUND_DEL_DETAIL_ORDERED_QTY}
                />
              </TableCell> */}
              <TableCell>
                ₱{(Number(item.INBOUND_DEL_DETAIL_LINE_PRICE) || 0).toFixed(2)}
              </TableCell>
              <TableCell>
                ₱
                {(item.INBOUND_DEL_DETAIL_LINE_QTY_DEFECT || 0) *
                  Number(item.INBOUND_DEL_DETAIL_LINE_PRICE).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>

      {/* Button Group for Cancel and Submit */}
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

// Styled Components
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

export default CustomerCreateIssueModal;

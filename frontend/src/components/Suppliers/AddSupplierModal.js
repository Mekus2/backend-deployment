import React, { useState } from "react";
import Modal from "../Layout/Modal"; // Assuming you already have a reusable Modal component
import styled from "styled-components";
import Button from "../Layout/Button";

const AddSupplierModal = ({ onClose, onAdd }) => {
  const [supplierName, setSupplierName] = useState("");
  const [supplierNumber, setSupplierNumber] = useState("0"); // Initialize with "0"
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonNumber, setContactPersonNumber] = useState("0"); // Initialize with "0"
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    if (!supplierName) newErrors.supplierName = "Supplier name is required.";
    if (!supplierNumber || supplierNumber.length !== 11) newErrors.supplierNumber = "Supplier number must be 11 digits.";
    if (!contactPersonName) newErrors.contactPersonName = "Contact person name is required.";
    if (!contactPersonNumber || contactPersonNumber.length !== 11) newErrors.contactPersonNumber = "Contact person number must be 11 digits.";
    return newErrors;
  };

  const handleAddSupplier = () => {
    const newErrors = validateFields();
    if (Object.keys(newErrors).length === 0) {
      const newSupplier = {
        supplierName,
        supplierNumber,
        contactPersonName,
        contactPersonNumber,
      };
      onAdd(newSupplier); // Pass the new supplier data to parent
      onClose(); // Close the modal after adding supplier
    } else {
      setErrors(newErrors);
    }
  };

  const handleSupplierNumberChange = (e) => {
    const value = e.target.value;

    // Prevent backspacing the leading "0"
    if (value.length === 0 || (value.length === 1 && value === "0")) {
      return; // Do nothing if trying to remove the only "0"
    }

    // Allow digits and ensure length is at most 11
    if (/^\d*$/.test(value) && value.length <= 11) {
      // Prepend "0" if the first character isn't already "0"
      setSupplierNumber(value.startsWith("0") ? value : "0" + value);
    }
  };

  const handleContactPersonNumberChange = (e) => {
    const value = e.target.value;

    // Prevent backspacing the leading "0"
    if (value.length === 0 || (value.length === 1 && value === "0")) {
      return; // Do nothing if trying to remove the only "0"
    }

    // Allow digits and ensure length is at most 11
    if (/^\d*$/.test(value) && value.length <= 11) {
      // Prepend "0" if the first character isn't already "0"
      setContactPersonNumber(value.startsWith("0") ? value : "0" + value);
    }
  };

  return (
    <Modal title="Add New Supplier" onClose={onClose}>
      <Form>
        <Label>Supplier Name</Label>
        {errors.supplierName && <Error>{errors.supplierName}</Error>}
        <Input
          type="text"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="Enter supplier name"
        />
        
        <Label>Supplier Number</Label>
        {errors.supplierNumber && <Error>{errors.supplierNumber}</Error>}
        <Input
          type="text"
          value={supplierNumber}
          onChange={handleSupplierNumberChange}
          placeholder="Enter supplier number"
          maxLength="11"
        />
        
        <Label>Contact Person Name</Label>
        {errors.contactPersonName && <Error>{errors.contactPersonName}</Error>}
        <Input
          type="text"
          value={contactPersonName}
          onChange={(e) => setContactPersonName(e.target.value)}
          placeholder="Enter contact person name"
        />
        
        <Label>Contact Person Number</Label>
        {errors.contactPersonNumber && <Error>{errors.contactPersonNumber}</Error>}
        <Input
          type="text"
          value={contactPersonNumber}
          onChange={handleContactPersonNumberChange}
          placeholder="Enter contact person number"
          maxLength="11"
        />
        
        <ButtonGroup>
          <Button variant="red" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSupplier}>
            Add Supplier
          </Button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

// Styled Components
const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Error = styled.p`
  color: red;
  font-size: 12px;
  margin-bottom: -13px; // Space between error message and input
`;

export default AddSupplierModal;

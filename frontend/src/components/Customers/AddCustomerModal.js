import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";
import { addCustomer } from "../../api/CustomerApi"; // Import the addCustomer API function
import { notify } from "../Layout/CustomToast"; // Import the toast notification utility

const AddCustomerModal = ({ onClose, onAdd }) => {
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientProvince, setClientProvince] = useState("");
  const [clientPhoneNum, setClientPhoneNum] = useState("0");
  const [errors, setErrors] = useState({});

  const validatePhoneNumber = (phoneNum) => {
    const phoneRegex = /^0\d{10}$/; // Must start with "0" and be exactly 11 digits
    return phoneRegex.test(phoneNum);
  };

  const handleAddCustomer = async () => {
    let newErrors = {};

    // Validate all fields are filled
    if (!clientName) newErrors.clientName = "Customer name is required";
    if (!clientAddress) newErrors.clientAddress = "Address is required";
    if (!clientProvince) newErrors.clientProvince = "Province is required";

    // Validate phone number
    if (!clientPhoneNum) {
      newErrors.clientPhoneNum = "Phone number is required";
    } else if (!validatePhoneNumber(clientPhoneNum)) {
      newErrors.clientPhoneNum = "Phone number must start with '0' and be exactly 11 digits";
    }

    if (Object.keys(newErrors).length === 0) {
      const newClient = {
        name: clientName,
        address: clientAddress,
        province: clientProvince,
        phoneNumber: clientPhoneNum,
      };

      try {
        const addedCustomer = await addCustomer(newClient);
        notify.success("Customer added successfully!");
        onAdd(addedCustomer);
        logCustomerCreation(addedCustomer);

        onClose();
      } catch (error) {
        console.error("Error adding customer:", error);
        notify.error("An error occurred while adding the customer.");
      }
    } else {
      setErrors(newErrors);
    }
  };

  const logCustomerCreation = async (addedCustomer) => {
    const userId = localStorage.getItem("user_id");

    const logPayload = {
      LLOG_TYPE: "User logs",
      LOG_DESCRIPTION: `Added new customer: 
      Name: ${addedCustomer.name}, 
      Address: ${addedCustomer.address}, 
      Province: ${addedCustomer.province}, 
      Phone Number: ${addedCustomer.phoneNumber}`,
      USER_ID: userId,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/logs/logs/", {
        method: "POST",
        body: JSON.stringify(logPayload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Customer log successfully created:", logPayload);
      } else {
        const errorData = await response.json();
        console.error("Failed to create log:", errorData);
      }
    } catch (error) {
      console.error("Error logging customer creation:", error);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;

    if (value === "" || (value.length > 0 && value[0] === "0")) {
      if (/^\d*$/.test(value) && value.length <= 11) {
        setClientPhoneNum(value.length === 0 ? "0" : value);
      }
    }
  };

  return (
    <Modal title="Add New Customer" onClose={onClose}>
      <Form>
        <Label>Customer Name</Label>
        {errors.clientName && <Error>{errors.clientName}</Error>}
        <Input
          type="text"
          placeholder="Enter Customer Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        <Label>Location</Label>
        <LocationContainer>
          <CityInput
            type="text"
            placeholder="Address"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
          />
          {errors.clientAddress && <Error>{errors.clientAddress}</Error>}
          <ProvinceInput
            type="text"
            placeholder="Province"
            value={clientProvince}
            onChange={(e) => setClientProvince(e.target.value)}
          />
          {errors.clientProvince && <Error>{errors.clientProvince}</Error>}
        </LocationContainer>

        <Label>Phone Number</Label>
        {errors.clientPhoneNum && <Error>{errors.clientPhoneNum}</Error>}
        <Input
          type="text"
          placeholder="Enter Phone Number"
          value={clientPhoneNum}
          maxLength="11"
          onChange={handlePhoneNumberChange}
        />

        <ButtonGroup>
          <Button variant="red" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCustomer}>
            Add Customer
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
`;

const Label = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const LocationContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const CityInput = styled(Input)`
  flex: 1;
`;

const ProvinceInput = styled(Input)`
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Error = styled.p`
  color: red;
  font-size: 12px;
  margin-bottom: -10px;
`;

export default AddCustomerModal;

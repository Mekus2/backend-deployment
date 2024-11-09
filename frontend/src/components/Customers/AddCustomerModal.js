import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";

const AddCustomerModal = ({ onClose, onAdd }) => {
  const [clientName, setClientName] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientProvince, setClientProvince] = useState("");
  const [clientPhoneNum, setClientPhoneNum] = useState("0"); // Initialize with "0"
  const [errors, setErrors] = useState({});

  const validatePhoneNumber = (phoneNum) => {
    const phoneRegex = /^0\d{10}$/; // Must start with "0" and be exactly 11 digits
    return phoneRegex.test(phoneNum);
  };

  const handleAddCustomer = () => {
    let newErrors = {};

    // Validate all fields are filled
    if (!clientName) newErrors.clientName = "Customer name is required";
    if (!clientCity) newErrors.clientCity = "City is required";
    if (!clientProvince) newErrors.clientProvince = "Province is required";

    // Validate phone number
    if (!clientPhoneNum) {
      newErrors.clientPhoneNum = "Phone number is required";
    } else if (!validatePhoneNumber(clientPhoneNum)) {
      newErrors.clientPhoneNum = "Phone number is required";
    }

    if (Object.keys(newErrors).length === 0) {
      const newClient = {
        CLIENT_NAME: clientName,
        CLIENT_CITY: clientCity,
        CLIENT_PROVINCE: clientProvince,
        CLIENT_PHONENUM: clientPhoneNum,
      };
      onAdd(newClient);
      onClose();
    } else {
      setErrors(newErrors);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;

    // Ensure the first digit is always "0"
    if (value === "" || (value.length > 0 && value[0] === "0")) {
      // Only allow digits and limit input to 11 characters
      if (/^\d*$/.test(value) && value.length <= 11) {
        // If the first character is "0", prevent erasing it
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
            placeholder="City"
            value={clientCity}
            onChange={(e) => setClientCity(e.target.value)}
          />
          {errors.clientCity && <Error>{errors.clientCity}</Error>}
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
          onChange={handlePhoneNumberChange} // Updated onChange
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
  gap: 10px; /* Space between city and province */
`;

const CityInput = styled(Input)`
  flex: 1; /* Allows the city input to take available space */
`;

const ProvinceInput = styled(Input)`
  flex: 1; /* Allows the province input to take available space */
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

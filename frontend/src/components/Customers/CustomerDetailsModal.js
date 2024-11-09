import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";

const CustomerDetailsModal = ({ client, onClose, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(client || {});
  const [errors, setErrors] = useState({});

  if (!client) return null; // Ensure modal doesn't render if client is undefined

  const validateFields = () => {
    let newErrors = {};

    // Validate required fields
    if (!editedClient.CLIENT_NAME) newErrors.CLIENT_NAME = "Customer name is required";
    if (!editedClient.CLIENT_CITY) newErrors.CLIENT_CITY = "City is required";
    if (!editedClient.CLIENT_PROVINCE) newErrors.CLIENT_PROVINCE = "Province is required";

    // Validate phone number
    if (!editedClient.CLIENT_PHONENUM) {
      newErrors.CLIENT_PHONENUM = "Phone number is required";
    } else if (!/^0\d{10}$/.test(editedClient.CLIENT_PHONENUM)) {
      newErrors.CLIENT_PHONENUM = "Phone number must be 11 digits and start with '0'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    if (validateFields()) {
      const confirmSave = window.confirm(
        "Are you sure you want to save the changes?"
      );
      if (confirmSave) {
        // Implement save logic here
        alert("Customer details saved");
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to discard the changes?"
    );
    if (confirmCancel) {
      setIsEditing(false);
      setEditedClient(client); // Reset to original client data on cancel
      setErrors({}); // Clear errors on cancel
    }
  };

  const handleRemove = () => {
    const confirmRemoval = window.confirm(
      "Are you sure you want to remove this customer?"
    );
    if (confirmRemoval) {
      onRemove(client.CLIENT_ID);
      onClose();
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;

    // Ensure the first digit is always "0" and limit input to 11 characters
    if (value.length <= 11) {
      // Allow only digits and start with "0"
      if (/^[0-9]*$/.test(value)) {
        setEditedClient({
          ...editedClient,
          CLIENT_PHONENUM: value.length === 0 ? "0" : value, // Ensure leading zero
        });
      }
    }
  };

  return (
    <Modal
      title={isEditing ? `Edit ${client.CLIENT_NAME}` : `Customer Details`}
      onClose={onClose}
    >
      {isEditing ? (
        <>
          <Details>
            <DetailItem>
              <strong>Customer Name:</strong>
              <Input
                type="text"
                value={editedClient.CLIENT_NAME || ""} // Add fallback to empty string
                onChange={(e) =>
                  setEditedClient({
                    ...editedClient,
                    CLIENT_NAME: e.target.value,
                  })
                }
                border
              />
              {errors.CLIENT_NAME && <Error>{errors.CLIENT_NAME}</Error>}
            </DetailItem>
            <DetailItem>
              <strong>Location</strong>
              <LocationContainer>
                <CityInput
                  type="text"
                  value={editedClient.CLIENT_CITY || ""}
                  onChange={(e) =>
                    setEditedClient({
                      ...editedClient,
                      CLIENT_CITY: e.target.value,
                    })
                  }
                  border
                />
                {errors.CLIENT_CITY && <Error>{errors.CLIENT_CITY}</Error>}
                <ProvinceInput
                  type="text"
                  value={editedClient.CLIENT_PROVINCE || ""}
                  onChange={(e) =>
                    setEditedClient({
                      ...editedClient,
                      CLIENT_PROVINCE: e.target.value,
                    })
                  }
                  border
                />
                {errors.CLIENT_PROVINCE && <Error>{errors.CLIENT_PROVINCE}</Error>}
              </LocationContainer>
            </DetailItem>
            <DetailItem>
              <strong>Phone Number:</strong>
              <Input
                type="tel"
                value={editedClient.CLIENT_PHONENUM || "0"} // Default to "0"
                onChange={handlePhoneNumberChange}
                border
              />
              {errors.CLIENT_PHONENUM && <Error>{errors.CLIENT_PHONENUM}</Error>}
            </DetailItem>
          </Details>
          <ButtonGroup>
            <Button variant="red" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Edit
            </Button>
          </ButtonGroup>
        </>
      ) : (
        <>
          <Section>
            <Detail>
              <DetailLabel>Client Name:</DetailLabel>{" "}
              {client.CLIENT_NAME || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Location:</DetailLabel>{" "}
              {`${client.CLIENT_CITY || "N/A"}, ${client.CLIENT_PROVINCE || "N/A"}`}
            </Detail>
            <Detail>
              <DetailLabel>Phone:</DetailLabel>{" "}
              {client.CLIENT_PHONENUM || "N/A"}
            </Detail>
          </Section>

          <ButtonGroup>
            <Button variant="red" onClick={handleRemove}>
              Remove
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              Edit
            </Button>
          </ButtonGroup>
        </>
      )}
    </Modal>
  );
};

// Styled Components
const Section = styled.div`
  margin-bottom: 20px;
`;

const Detail = styled.div`
  margin-bottom: 10px;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  margin-right: 10px;
`;

const Details = styled.div`
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 4px;
  border: ${(props) => (props.border ? "1px solid #ccc" : "none")};
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
  justify-content: flex-end;
  gap: 10px;
`;

const Error = styled.p`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;

export default CustomerDetailsModal;

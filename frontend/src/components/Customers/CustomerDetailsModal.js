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
    if (!editedClient.name) newErrors.name = "Customer name is required";
    if (!editedClient.address) newErrors.address = "Address is required"; // Changed from 'city' to 'address'
    if (!editedClient.province) newErrors.province = "Province is required";

    // Validate phone number
    if (!editedClient.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^0\d{10}$/.test(editedClient.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 11 digits and start with '0'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    if (validateFields()) {
      const confirmSave = window.confirm("Are you sure you want to save the changes?");
      if (confirmSave) {
        try {
          // Create a new object with only the changed fields
          const updatedClient = { ...editedClient };
  
          // Remove the errors field (if any) from the object before sending to backend
          delete updatedClient.errors;
  
          // Send the PUT request with only the updated fields
          const response = await fetch(`http://127.0.0.1:8000/customer/clients/${client.id}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedClient), // Send the edited data (partial fields)
          });
  
          if (!response.ok) {
            // Handle error if the request fails
            const errorData = await response.json();
            alert(`Error: ${errorData.message || 'Failed to update customer details'}`);
          } else {
            // Handle success
            alert("Customer details saved successfully!");
            setIsEditing(false);
            onClose(); // Close the modal after saving
          }
        } catch (error) {
          // Handle network or other errors
          alert(`Error: ${error.message}`);
        }
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
      onRemove(client.id); // Make sure `client.id` exists
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
          phoneNumber: value.length === 0 ? "0" : value, // Ensure leading zero
        });
      }
    }
  };

  return (
    <Modal
      title={isEditing ? `Edit ${client.name}` : `Customer Details`}
      onClose={onClose}
    >
      {isEditing ? (
        <>
          <Details>
            <DetailItem>
              <strong>Customer Name:</strong>
              <Input
                type="text"
                value={editedClient.name || ""} // Adjusted to match API response
                onChange={(e) =>
                  setEditedClient({
                    ...editedClient,
                    name: e.target.value,
                  })
                }
                border
              />
              {errors.name && <Error>{errors.name}</Error>}
            </DetailItem>
            <DetailItem>
              <strong>Location</strong>
              <LocationContainer>
                <AddressInput
                  type="text"
                  value={editedClient.address || ""} // Updated to 'address'
                  onChange={(e) =>
                    setEditedClient({
                      ...editedClient,
                      address: e.target.value, // Updated to 'address'
                    })
                  }
                  border
                  placeholder="Address" // Placeholder for the Address input
                />
                {errors.address && <Error>{errors.address}</Error>} {/* Updated validation */}
                
                <ProvinceInput
                  type="text"
                  value={editedClient.province || ""}
                  onChange={(e) =>
                    setEditedClient({
                      ...editedClient,
                      province: e.target.value,
                    })
                  }
                  border
                  placeholder="Province" // Placeholder for the Province input
                />
                {errors.province && <Error>{errors.province}</Error>}
              </LocationContainer>
            </DetailItem>
            <DetailItem>
              <strong>Phone Number:</strong>
              <Input
                type="tel"
                value={editedClient.phoneNumber || "0"} // Default to "0"
                onChange={handlePhoneNumberChange}
                border
              />
              {errors.phoneNumber && <Error>{errors.phoneNumber}</Error>}
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
              {client.name || "N/A"} {/* Adjust field name based on API response */}
            </Detail>
            <Detail>
              <DetailLabel>Location:</DetailLabel>{" "}
              {`${client.address || "N/A"}, ${client.province || "N/A"}`} {/* Updated to address */}
            </Detail>
            <Detail>
              <DetailLabel>Phone:</DetailLabel>{" "}
              {client.phoneNumber || "N/A"}
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
  gap: 10px; /* Space between address and province */
`;

const AddressInput = styled(Input)`
  flex: 1; /* Allows the address input to take available space */
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
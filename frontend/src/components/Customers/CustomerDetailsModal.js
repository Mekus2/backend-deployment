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
    if (!editedClient.address) newErrors.address = "Address is required";
    if (!editedClient.province) newErrors.province = "Province is required";

    // Validate phone number
    if (!editedClient.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^0\d{10}$/.test(editedClient.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 11 digits and start with '0'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    if (validateFields()) {
      const confirmSave = window.confirm(
        "Are you sure you want to save the changes?"
      );
      if (confirmSave) {
        try {
          const updatedClient = { ...editedClient };
          const response = await fetch(
            `http://127.0.0.1:8000/customer/clients/${client.id}/`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedClient),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            alert(
              `Error: ${errorData.message || "Failed to update customer details"}`
            );
          } else {
            alert("Customer details updated successfully!");
            await logCustomerCreation(client, updatedClient);
            setIsEditing(false);
            onClose();
          }
        } catch (error) {
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
      setEditedClient(client);
      setErrors({});
    }
  };

  const handleRemove = () => {
    const confirmRemoval = window.confirm(
      "Are you sure you want to remove this customer?"
    );
    if (confirmRemoval) {
      onRemove(client.id);
      onClose();
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 11) {
      setEditedClient({
        ...editedClient,
        phoneNumber: value,
      });
    }
  };

  const logCustomerCreation = async (oldClient, updatedClient) => {
    // Fetch the user_id from localStorage
    const userId = localStorage.getItem("user_id");

    // Prepare the fields for logging changes
    const changes = [];
    const fieldsToCheck = [
        { field: "name", label: "Customer Name" },
        { field: "address", label: "Address" },
        { field: "province", label: "Province" },
        { field: "phoneNumber", label: "Phone Number" },
    ];

    // Check for changes and format them for logging
    fieldsToCheck.forEach(({ field, label }) => {
        if (oldClient[field] !== updatedClient[field]) {
            changes.push(
                `${label} changed from "${oldClient[field] || "N/A"}" to "${
                    updatedClient[field] || "N/A"
                }"`
            );
        }
    });

    // If there are changes, prepare the log payload
    if (changes.length > 0) {
        const logPayload = {
            LLOG_TYPE: "User logs",
            LOG_DESCRIPTION: `Updated Customer details:\n${changes.join("\n")}`,
            USER_ID: userId,
        };

        try {
            // Send the log data to the backend
            const response = await fetch("http://127.0.0.1:8000/logs/logs/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(logPayload),
            });

            // Handle the response
            if (response.ok) {
                console.log("Customer updated details:", logPayload);
            } else {
                const errorData = await response.json();
                console.error("Failed to create log:", errorData);
            }
        } catch (error) {
            console.error("Error logging customer updates:", error);
        }
    } else {
        console.log("No changes detected. Logging skipped.");
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
                value={editedClient.name || ""}
                onChange={(e) =>
                  setEditedClient({ ...editedClient, name: e.target.value })
                }
                border
              />
              {errors.name && <Error>{errors.name}</Error>}
            </DetailItem>
            <DetailItem>
              <strong>Location:</strong>
              <LocationContainer>
                <AddressInput
                  type="text"
                  value={editedClient.address || ""}
                  onChange={(e) =>
                    setEditedClient({ ...editedClient, address: e.target.value })
                  }
                  border
                  placeholder="Address"
                />
                {errors.address && <Error>{errors.address}</Error>}
                <ProvinceInput
                  type="text"
                  value={editedClient.province || ""}
                  onChange={(e) =>
                    setEditedClient({ ...editedClient, province: e.target.value })
                  }
                  border
                  placeholder="Province"
                />
                {errors.province && <Error>{errors.province}</Error>}
              </LocationContainer>
            </DetailItem>
            <DetailItem>
              <strong>Phone Number:</strong>
              <Input
                type="tel"
                value={editedClient.phoneNumber || ""}
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
              {client.name || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Location:</DetailLabel>{" "}
              {`${client.address || "N/A"}, ${client.province || "N/A"}`}
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

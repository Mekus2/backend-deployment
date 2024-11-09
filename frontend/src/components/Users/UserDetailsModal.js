// src/components/Users/UserDetailsModal.js
import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";
import { colors } from "../../colors"; // Import the colors

const UserDetailsModal = ({ client, onClose, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(client || {});

  if (!client) return null; // Ensure modal doesn't render if client is undefined

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    const confirmSave = window.confirm(
      "Are you sure you want to save the changes?"
    );
    if (confirmSave) {
      // Implement save logic here
      alert("User details saved");
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to discard the changes?"
    );
    if (confirmCancel) {
      setIsEditing(false);
      setEditedUser(client); // Reset to original client data on cancel
    }
  };

  const handleToggleActivation = () => {
    const confirmToggle = window.confirm(
      `Are you sure you want to ${
        client.USER_ISACTIVE ? "deactivate" : "activate"
      } this user?`
    );
    if (confirmToggle) {
      onRemove(client.USER_ID); // Call onRemove with user ID
      onClose();
    }
  };

  return (
    <Modal
      title={
        isEditing
          ? `Edit ${editedUser.USER_FIRSTNAME} ${editedUser.USER_LASTNAME}`
          : `User Details`
      }
      onClose={onClose}
    >
      {isEditing ? (
        <>
          <Details>
            <DetailItem>
              <strong>First Name:</strong>
              <Input
                type="text"
                value={editedUser.USER_FIRSTNAME || ""}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    USER_FIRSTNAME: e.target.value,
                  })
                }
                border
              />
            </DetailItem>
            <DetailItem>
              <strong>Last Name:</strong>
              <Input
                type="text"
                value={editedUser.USER_LASTNAME || ""}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    USER_LASTNAME: e.target.value,
                  })
                }
                border
              />
            </DetailItem>
            <DetailItem>
              <strong>Email:</strong>
              <Input
                type="email"
                value={editedUser.USER_EMAIL || ""}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    USER_EMAIL: e.target.value,
                  })
                }
                border
              />
            </DetailItem>
            <DetailItem>
              <strong>Username:</strong>
              <Input
                type="text"
                value={editedUser.USER_USERNAME || ""}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    USER_USERNAME: e.target.value,
                  })
                }
                border
              />
            </DetailItem>
            <DetailItem>
              <strong>Phone Number:</strong>
              <Input
                type="tel"
                value={editedUser.USER_PHONENUMBER || ""}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    USER_PHONENUMBER: e.target.value,
                  })
                }
                border
              />
            </DetailItem>
            <DetailItem>
              <strong>Address:</strong>
              <Input
                type="text"
                value={editedUser.USER_ADDRESS || ""}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    USER_ADDRESS: e.target.value,
                  })
                }
                border
              />
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
              <DetailLabel>First Name:</DetailLabel>{" "}
              {client.USER_FIRSTNAME || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Last Name:</DetailLabel>{" "}
              {client.USER_LASTNAME || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Email:</DetailLabel> {client.USER_EMAIL || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Username:</DetailLabel>{" "}
              {client.USER_USERNAME || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Phone:</DetailLabel>{" "}
              {client.USER_PHONENUMBER || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Address:</DetailLabel> {client.USER_ADDRESS || "N/A"}
            </Detail>
          </Section>

          <ButtonGroup>
            <Button
              backgroundColor={client.USER_ISACTIVE ? colors.red : colors.green}
              hoverColor={
                client.USER_ISACTIVE ? colors.redHover : colors.greenHover
              }
              onClick={handleToggleActivation}
            >
              {client.USER_ISACTIVE ? "Deactivate" : "Activate"}
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export default UserDetailsModal;

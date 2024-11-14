import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";

const UserDetailsModal = ({ user, onClose, onRemove }) => {
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal

  if (!user) return null; // Ensure modal doesn't render if user is undefined

  // Function to handle the deactivation request
  const handleDeactivate = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/account/deactivateUser/${user.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("User has been deactivated successfully.");
        if (onRemove) onRemove(); // Optionally trigger onRemove callback
        onClose(); // Close the modal after deactivation
      } else {
        alert("Failed to deactivate user.");
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("An error occurred while deactivating the user.");
    }
  };

  return (
    <>
      <Modal title={`User Details`} onClose={onClose}>
        <Section>
          <Detail>
            <DetailLabel>First Name:</DetailLabel> {user.first_name || "N/A"}
          </Detail>
          <Detail>
            <DetailLabel>Last Name:</DetailLabel> {user.last_name || "N/A"}
          </Detail>
          <Detail>
            <DetailLabel>Address:</DetailLabel> {user.address || "N/A"}
          </Detail>
          <Detail>
            <DetailLabel>Email:</DetailLabel> {user.email || "N/A"}
          </Detail>
          <Detail>
            <DetailLabel>Username:</DetailLabel> {user.username || "N/A"}
          </Detail>
          <Detail>
            <DetailLabel>Phone Number:</DetailLabel> {user.phonenumber || "N/A"}
          </Detail>
        </Section>
        <ButtonGroup>
          <Button variant="red" onClick={() => setShowConfirmation(true)}>
            Deactivate
          </Button>
        </ButtonGroup>
      </Modal>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <Modal title="Confirm Deactivation" onClose={() => setShowConfirmation(false)}>
          <ConfirmationText>
            Are you sure you want to deactivate this user?
          </ConfirmationText>
          <ButtonGroup>
            <Button variant="red" onClick={handleDeactivate}>
              Yes, Deactivate
            </Button>
            <Button variant="default" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
          </ButtonGroup>
        </Modal>
      )}
    </>
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ConfirmationText = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
  text-align: center;
`;

export default UserDetailsModal;

import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";

const UserDetailsModal = ({ user, onClose, onRemove }) => {
  const [showConfirmation, setShowConfirmation] = useState(false); // State for confirmation modal
  console.log("User active status:", user.isActive);

  if (!user) return null; // Ensure modal doesn't render if user is undefined

  // Defaulting isActive to false if undefined
  const isActive = user.isActive ?? false; // This ensures that undefined is treated as false

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
        logUserCreation(user, "deactivated"); // Log the status change
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

  // Function to handle the activation request
  const handleActivate = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/account/reactivateUser/${user.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("User has been activated successfully.");
        logUserCreation(user, "activated"); // Log the status change
        if (onRemove) onRemove(); // Optionally trigger onRemove callback
        onClose(); // Close the modal after activation
      } else {
        alert("Failed to activate user.");
      }
    } catch (error) {
      console.error("Error activating user:", error);
      alert("An error occurred while activating the user.");
    }
  };

  const logUserCreation = async (user, status) => {
    const userId = localStorage.getItem("user_id"); // Fetch the user_id from localStorage

    const logPayload = {
      LLOG_TYPE: "User logs",
      LOG_DESCRIPTION: `User ${user.first_name} ${user.last_name} was ${status}.`,
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
        console.log("Log successfully created:", logPayload);
      } else {
        const errorData = await response.json();
        console.error("Failed to create log:", errorData);
      }
    } catch (error) {
      console.error("Error logging user status change:", error);
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

        {/* Button changes based on isActive */}
        <ButtonGroup>
          <Button
            variant={isActive ? "red" : "green"} // Red for Deactivate, Green for Activate
            onClick={isActive ? () => setShowConfirmation(true) : handleActivate}
          >
            {isActive ? "Deactivate" : "Activate"} {/* Toggle button text */}
          </Button>
        </ButtonGroup>
      </Modal>

      {/* Confirmation Modal for Deactivation */}
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

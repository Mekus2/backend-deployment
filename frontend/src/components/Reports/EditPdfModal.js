import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { colors } from "../../colors"; // Import colors for consistent styling
import { IoCloseCircle } from "react-icons/io5";
import { saveCompanyDetailsToDB, getCompanyDetailsFromDB } from "../../utils/indexDBHelpers"; // Assume these helper functions handle IndexDB storage
import Button from "../Layout/Button"; // Use consistent Button component

const EditPdfModal = ({ onClose, onSave }) => {
  const [companyName, setCompanyName] = useState("");
  const [companyDetails, setCompanyDetails] = useState(""); // Change variable name
  const modalRef = useRef();

  // Fetch saved details from IndexDB when modal loads
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      const details = await getCompanyDetailsFromDB();
      if (details) {
        setCompanyName(details.name || "");
        setCompanyDetails(details.number || ""); // Use new variable name
      }
    };
    fetchCompanyDetails();
  }, []);

  // Close modal when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  // Save company details
  const handleSave = async () => {
    const updatedDetails = { name: companyName, number: companyDetails }; // Use new variable name
    try {
      await saveCompanyDetailsToDB(updatedDetails);
      onSave(updatedDetails); // Pass updated details back to the parent component
      alert("Company details saved successfully!"); // Success message
      onClose();
    } catch (error) {
      alert("Failed to save company details. Please try again."); // Error message
    }
  };

  return (
    <ModalOverlay>
      <ModalContent ref={modalRef}>
        <ModalHeader>
          <h2>Edit Company Details</h2>
          <CloseButton onClick={onClose}>
            <IoCloseCircle />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <Field>
            <Label>Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
          </Field>
          <Field>
            <Label>Company Details</Label> {/* Updated label */}
            <Input
              value={companyDetails}
              onChange={(e) => setCompanyDetails(e.target.value)} // Use new variable name
              placeholder="Enter company details"
            />
          </Field>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="red" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${colors.red};
`;

const ModalBody = styled.div``;

const Field = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export default EditPdfModal;

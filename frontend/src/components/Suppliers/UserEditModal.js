import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Modal from "../Layout/Modal";
import Button from "../Layout/Button";

const UserEditModal = ({ supplier, onClose, onSave }) => {
  const [editedSupplier, setEditedSupplier] = useState({ ...supplier }); // Initialize with supplier data

  const handleSave = () => {
    const confirmSave = window.confirm(
      "Are you sure you want to save the changes?"
    );
    if (confirmSave) {
      onSave(editedSupplier); // Call the onSave function with the edited supplier
      onClose(); // Close the modal after saving
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to discard the changes?"
    );
    if (confirmCancel) {
      onClose();
    }
  };

  return (
    <Modal title={`Edit ${supplier.SUPP_COMPANY_NAME}`} onClose={onClose}>
      <Details>
        <DetailItem>
          <strong>Supplier Name:</strong>
          <Input
            type="text"
            value={editedSupplier.SUPP_COMPANY_NAME || ""}
            onChange={(e) =>
              setEditedSupplier({
                ...editedSupplier,
                SUPP_COMPANY_NAME: e.target.value,
              })
            }
          />
        </DetailItem>
        <DetailItem>
          <strong>Supplier Number:</strong>
          <Input
            type="text"
            value={editedSupplier.SUPP_COMPANY_NUM || ""}
            onChange={(e) =>
              setEditedSupplier({
                ...editedSupplier,
                SUPP_COMPANY_NUM: e.target.value,
              })
            }
          />
        </DetailItem>
        <DetailItem>
          <strong>Contact Person:</strong>
          <Input
            type="text"
            value={editedSupplier.SUPP_CONTACT_NAME || ""}
            onChange={(e) =>
              setEditedSupplier({
                ...editedSupplier,
                SUPP_CONTACT_NAME: e.target.value,
              })
            }
          />
        </DetailItem>
        <DetailItem>
          <strong>Contact Number:</strong>
          <Input
            type="text"
            value={editedSupplier.SUPP_CONTACT_PHNUM || ""}
            onChange={(e) =>
              setEditedSupplier({
                ...editedSupplier,
                SUPP_CONTACT_PHNUM: e.target.value,
              })
            }
          />
        </DetailItem>
      </Details>
      <ButtonGroup>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="red" onClick={handleCancel}>
          Cancel
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

// Prop Types for validation
UserEditModal.propTypes = {
  supplier: PropTypes.shape({
    SUPP_ID: PropTypes.string.isRequired,
    SUPP_COMPANY_NAME: PropTypes.string,
    SUPP_COMPANY_NUM: PropTypes.string,
    SUPP_CONTACT_NAME: PropTypes.string,
    SUPP_CONTACT_PHNUM: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

// Styled Components
const Details = styled.div`
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Input = styled.input`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
`;

export default UserEditModal;

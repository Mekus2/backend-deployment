import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Modal from "../Layout/Modal";
import Button from "../Layout/Button";

const SupplierDetailsModal = ({ supplier, onClose, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState(supplier || {});
  const [errors, setErrors] = useState({});

  if (!supplier) return null;

  const handleEdit = () => setIsEditing(true);

  const validateInputs = () => {
    let newErrors = {};

    if (!editedSupplier.SUPP_COMPANY_NAME) {
      newErrors.SUPP_COMPANY_NAME = "Company name is required";
    }
    if (!editedSupplier.SUPP_COMPANY_NUM) {
      newErrors.SUPP_COMPANY_NUM = "Company number is required";
    }
    if (!editedSupplier.SUPP_CONTACT_NAME) {
      newErrors.SUPP_CONTACT_NAME = "Contact name is required";
    }
    if (!editedSupplier.SUPP_CONTACT_PHNUM) {
      newErrors.SUPP_CONTACT_PHNUM = "Contact number is required";
    } else if (!/^0\d{10}$/.test(editedSupplier.SUPP_CONTACT_PHNUM)) {
      newErrors.SUPP_CONTACT_PHNUM = "Phone number must be 11 digits and start with '0'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateInputs()) {
      const confirmSave = window.confirm(
        "Are you sure you want to save the changes?"
      );
      if (confirmSave) {
        alert("Supplier details saved");
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
      setEditedSupplier(supplier);
    }
  };

  const handleRemove = () => {
    const confirmRemoval = window.confirm(
      "Are you sure you want to remove this supplier?"
    );
    if (confirmRemoval) {
      if (typeof onRemove === "function") {
        onRemove(supplier.SUPP_ID);
      } else {
        console.error("onRemove is not a function");
      }
      onClose();
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;

    if (value === "" || value.startsWith("0")) {
      if (/^\d*$/.test(value) && value.length <= 11) {
        setEditedSupplier({
          ...editedSupplier,
          SUPP_CONTACT_PHNUM: value,
        });
      }
    } else if (value.length > 0 && !value.startsWith("0")) {
      setEditedSupplier({
        ...editedSupplier,
        SUPP_CONTACT_PHNUM: "0" + value.replace(/^0*/, ""),
      });
    }
  };

  const handleCompanyNumberChange = (e) => {
    const value = e.target.value;

    if (value === "" || value.startsWith("0")) {
      if (/^\d*$/.test(value) && value.length <= 11) {
        setEditedSupplier({
          ...editedSupplier,
          SUPP_COMPANY_NUM: value,
        });
      }
    } else if (value.length > 0 && !value.startsWith("0")) {
      setEditedSupplier({
        ...editedSupplier,
        SUPP_COMPANY_NUM: "0" + value.replace(/^0*/, ""),
      });
    }
  };

  return (
    <Modal
      title={
        isEditing
          ? `Edit ${supplier.SUPP_COMPANY_NAME}`
          : `${supplier.SUPP_COMPANY_NAME} Details`
      }
      onClose={onClose}
    >
      {isEditing ? (
        <>
          <Details>
            <DetailItem>
              <Label>Company Name:</Label>
              {errors.SUPP_COMPANY_NAME && (
                <Error>{errors.SUPP_COMPANY_NAME}</Error>
              )}
              <Input
                type="text"
                value={editedSupplier.SUPP_COMPANY_NAME || ""}
                onChange={(e) =>
                  setEditedSupplier({
                    ...editedSupplier,
                    SUPP_COMPANY_NAME: e.target.value,
                  })
                }
                border
              />
            </DetailItem>

            <DetailItem>
              <Label>Company Number:</Label>
              {errors.SUPP_COMPANY_NUM && (
                <Error>{errors.SUPP_COMPANY_NUM}</Error>
              )}
              <Input
                type="text"
                value={editedSupplier.SUPP_COMPANY_NUM || "0"}
                onChange={handleCompanyNumberChange}
                border
              />
            </DetailItem>

            <DetailItem>
              <Label>Contact Name:</Label>
              {errors.SUPP_CONTACT_NAME && (
                <Error>{errors.SUPP_CONTACT_NAME}</Error>
              )}
              <Input
                type="text"
                value={editedSupplier.SUPP_CONTACT_NAME || ""}
                onChange={(e) =>
                  setEditedSupplier({
                    ...editedSupplier,
                    SUPP_CONTACT_NAME: e.target.value,
                  })
                }
                border
              />

            </DetailItem>

            <DetailItem>
              <Label>Contact Number:</Label>
              {errors.SUPP_CONTACT_PHNUM && (
                <Error>{errors.SUPP_CONTACT_PHNUM}</Error>
              )}
              <Input
                type="text"
                value={editedSupplier.SUPP_CONTACT_PHNUM || "0"}
                onChange={handlePhoneNumberChange}
                border
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
        </>
      ) : (
        <>
          <Section>
            <Detail>
              <DetailLabel>Company Name:</DetailLabel>{" "}
              {supplier.SUPP_COMPANY_NAME}
            </Detail>
            <Detail>
              <DetailLabel>Company Number:</DetailLabel>{" "}
              {supplier.SUPP_COMPANY_NUM}
            </Detail>
            <Detail>
              <DetailLabel>Contact Name:</DetailLabel>{" "}
              {supplier.SUPP_CONTACT_NAME}
            </Detail>
            <Detail>
              <DetailLabel>Contact Number:</DetailLabel>{" "}
              {supplier.SUPP_CONTACT_PHNUM}
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

SupplierDetailsModal.propTypes = {
  supplier: PropTypes.shape({
    SUPP_ID: PropTypes.string.isRequired,
    SUPP_COMPANY_NAME: PropTypes.string,
    SUPP_COMPANY_NUM: PropTypes.string,
    SUPP_CONTACT_NAME: PropTypes.string,
    SUPP_CONTACT_PHNUM: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
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

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 4px;
`;

const Input = styled.input`
  border: ${(props) => (props.border ? "1px solid #ddd" : "none")};
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const Error = styled.p`
  color: red;
  font-size: 12px;
  margin: 4px 0 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Detail = styled.div`
  margin-bottom: 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  margin-right: 8px;
`;

export default SupplierDetailsModal;

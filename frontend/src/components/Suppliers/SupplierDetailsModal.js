import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";

const SupplierDetailsModal = ({ supplier, onClose, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState(supplier || {});
  const [errors, setErrors] = useState({});

  if (!supplier) return null;

  const validateFields = () => {
    let newErrors = {};

    if (!editedSupplier.Supp_Company_Name) newErrors.Supp_Company_Name = "Company name is required";
    if (!editedSupplier.Supp_Company_Num) newErrors.Supp_Company_Num = "Company number is required";
    if (!editedSupplier.Supp_Contact_Pname) newErrors.Supp_Contact_Pname = "Contact person name is required";
    if (!editedSupplier.Supp_Contact_Num) newErrors.Supp_Contact_Num = "Contact number is required";
    else if (!/^\d{10,15}$/.test(editedSupplier.Supp_Contact_Num)) {
      newErrors.Supp_Contact_Num = "Contact number must be 10-15 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    if (validateFields()) {
      const confirmSave = window.confirm("Are you sure you want to save the changes?");
      if (confirmSave) {
        try {
          const updatedSupplier = { ...editedSupplier };
          delete updatedSupplier.errors;

          const response = await fetch(`http://127.0.0.1:8000/supplier/suppliers/${supplier.id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSupplier),
          });

          if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || "Failed to update supplier details"}`);
          } else {
            alert("Supplier details saved successfully!");
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
    const confirmCancel = window.confirm("Are you sure you want to discard the changes?");
    if (confirmCancel) {
      setIsEditing(false);
      setEditedSupplier(supplier);
      setErrors({});
    }
  };

  const handleRemove = () => {
    const confirmRemoval = window.confirm("Are you sure you want to remove this supplier?");
    if (confirmRemoval) {
      onRemove(supplier.id);
      onClose();
    }
  };

  return (
    <Modal
      title={isEditing ? `Edit ${supplier.Supp_Company_Name}` : `Supplier Details`}
      onClose={onClose}
    >
      {isEditing ? (
        <>
          <Details>
            <DetailItem>
              <strong>Company Name:</strong>
              <Input
                type="text"
                value={editedSupplier.Supp_Company_Name || ""}
                onChange={(e) =>
                  setEditedSupplier({ ...editedSupplier, Supp_Company_Name: e.target.value })
                }
                border
              />
              {errors.Supp_Company_Name && <Error>{errors.Supp_Company_Name}</Error>}
            </DetailItem>
            <DetailItem>
              <strong>Company Number:</strong>
              <Input
                type="text"
                value={editedSupplier.Supp_Company_Num || ""}
                onChange={(e) =>
                  setEditedSupplier({ ...editedSupplier, Supp_Company_Num: e.target.value })
                }
                border
              />
              {errors.Supp_Company_Num && <Error>{errors.Supp_Company_Num}</Error>}
            </DetailItem>
            <DetailItem>
              <strong>Contact Person Name:</strong>
              <Input
                type="text"
                value={editedSupplier.Supp_Contact_Pname || ""}
                onChange={(e) =>
                  setEditedSupplier({ ...editedSupplier, Supp_Contact_Pname: e.target.value })
                }
                border
              />
              {errors.Supp_Contact_Pname && <Error>{errors.Supp_Contact_Pname}</Error>}
            </DetailItem>
            <DetailItem>
              <strong>Contact Number:</strong>
              <Input
                type="text"
                value={editedSupplier.Supp_Contact_Num || ""}
                onChange={(e) =>
                  setEditedSupplier({ ...editedSupplier, Supp_Contact_Num: e.target.value })
                }
                border
              />
              {errors.Supp_Contact_Num && <Error>{errors.Supp_Contact_Num}</Error>}
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
              <DetailLabel>Company Name:</DetailLabel> {supplier.Supp_Company_Name || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Company Number:</DetailLabel> {supplier.Supp_Company_Num || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Contact Person:</DetailLabel> {supplier.Supp_Contact_Pname || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Contact Number:</DetailLabel> {supplier.Supp_Contact_Num || "N/A"}
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

export default SupplierDetailsModal;

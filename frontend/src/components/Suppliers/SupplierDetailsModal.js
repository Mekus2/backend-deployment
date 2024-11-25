import React, { useState } from "react";
import Modal from "../Layout/Modal";
import styled from "styled-components";
import Button from "../Layout/Button";

const SupplierDetailsModal = ({ supplier, onClose, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState(supplier || {});
  const [errors, setErrors] = useState({});

  if (!supplier) return null; // Ensure modal doesn't render if supplier is undefined

  const validateFields = () => {
    let newErrors = {};

    // Validate required fields
    if (!editedSupplier.Supp_Company_Name) {
      newErrors.Supp_Company_Name = "Company name is required";
    }
    if (!editedSupplier.Supp_Company_Num) {
      newErrors.Supp_Company_Num = "Company number is required";
    }
    if (!editedSupplier.Supp_Contact_Pname) {
      newErrors.Supp_Contact_Pname = "Contact name is required";
    }
    if (!editedSupplier.Supp_Contact_Num) {
      newErrors.Supp_Contact_Num
      = "Contact number is required";
    } else if (!/^0\d{10}$/.test(editedSupplier.Supp_Contact_Num
    )) {
      newErrors.Supp_Contact_Num
      =
        "Phone number must be 11 digits and start with '0'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    if (validateFields()) {
      const confirmSave = window.confirm(
        "Are you sure you want to save the changes?"
      );
      if (confirmSave) {
        try {
          const updatedSupplier = { ...editedSupplier };
          const response = await fetch(
            `http://127.0.0.1:8000/supplier/suppliers/${supplier.id}/`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedSupplier),
            }
          );
          console.log('updated:', updatedSupplier );

          if (!response.ok) {
            const errorData = await response.json();
            alert(
              `Error: ${errorData.message || "Failed to update supplier details"}`
            );
          } else {
            alert("Supplier details saved successfully!");
            await logUserCreation(supplier, updatedSupplier);
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
      setEditedSupplier(supplier);
      setErrors({});
    }
  };

  const handleRemove = () => {
    const confirmRemoval = window.confirm(
      "Are you sure you want to remove this supplier?"
    );
    if (confirmRemoval) {
      onRemove(supplier.SUPP_ID);
      onClose();
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 11) {
      setEditedSupplier({
        ...editedSupplier,
        Supp_Contact_Num: value,
      });
    }
  };

  const logUserCreation = async (oldSupplier, updatedSupplier) => {
    // Fetch the user_id from localStorage
    const userId = localStorage.getItem("user_id");
  
    // Prepare the fields for logging changes
    const changes = [];
    const fieldsToCheck = [
      { field: "Supp_Company_Name", label: "Company Name" },
      { field: "Supp_Company_Num", label: "Company Number" },
      { field: "Supp_Contact_Pname", label: "Contact Person Name" },
      { field: "Supp_Contact_Num", label: "Contact Person Number" },
    ];
  
    fieldsToCheck.forEach(({ field, label }) => {
      if (oldSupplier[field] !== updatedSupplier[field]) {
        changes.push(
          `${label} changed from "${oldSupplier[field] || "N/A"}" to "${
            updatedSupplier[field] || "N/A"
          }"`
        );
      }
    });
  
    // Prepare the log payload
    const logPayload = {
      LLOG_TYPE: "User logs",
      LOG_DESCRIPTION: `Updated Supplier details:\n${changes.join("\n")}`,
      USER_ID: userId,
    };
  
    try {
      // Send the log data to the backend
      const response = await fetch("http://127.0.0.1:8000/logs/logs/", {
        method: "POST",
        body: JSON.stringify(logPayload),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        console.log("Supplier log successfully created:", logPayload);
      } else {
        const errorData = await response.json();
        console.error("Failed to create log:", errorData);
      }
    } catch (error) {
      console.error("Error logging user changes:", error);
    }
  };


  return (
    <Modal
      title={
        isEditing ? `Edit ${supplier.Supp_Company_Name}` : "Supplier Details"
      }
      onClose={onClose}
    >
      {isEditing ? (
        <>
          <Details>
            <DetailItem>
              <Label>Company Name:</Label>
              <Input
                type="text"
                value={editedSupplier.Supp_Company_Name || ""}
                onChange={(e) =>
                  setEditedSupplier({
                    ...editedSupplier,
                    Supp_Company_Name: e.target.value,
                  })
                }
              />
              {errors.Supp_Company_Name && (
                <Error>{errors.Supp_Company_Name}</Error>
              )}
            </DetailItem>
            <DetailItem>
              <Label>Company Number:</Label>
              <Input
                type="text"
                value={editedSupplier.Supp_Company_Num || ""}
                onChange={(e) =>
                  setEditedSupplier({
                    ...editedSupplier,
                    Supp_Company_Num: e.target.value,
                  })
                }
              />
              {errors.Supp_Company_Num && (
                <Error>{errors.Supp_Company_Num}</Error>
              )}
            </DetailItem>
            <DetailItem>
              <Label>Contact Name:</Label>
              <Input
                type="text"
                value={editedSupplier.Supp_Contact_Pname || ""}
                onChange={(e) =>
                  setEditedSupplier({
                    ...editedSupplier,
                    Supp_Contact_Pname: e.target.value,
                  })
                }
              />
              {errors.Supp_Contact_Name && (
                <Error>{errors.Supp_Contact_Name}</Error>
              )}
            </DetailItem>
            <DetailItem>
              <Label>Contact Number:</Label>
              <Input
                type="tel"
                value={editedSupplier.Supp_Contact_Num || ""}
                onChange={handlePhoneNumberChange}
              />
              {errors.Supp_Contact_Num && (
                <Error>{errors.Supp_Contact_Num}</Error>
              )}
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
              <DetailLabel>Company Name:</DetailLabel>{" "}
              {supplier.Supp_Company_Name || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Company Number:</DetailLabel>{" "}
              {supplier.Supp_Company_Num || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Contact Name:</DetailLabel>{" "}
              {supplier.Supp_Contact_Pname || "N/A"}
            </Detail>
            <Detail>
              <DetailLabel>Contact Number:</DetailLabel>{" "}
              {supplier.Supp_Contact_Num  || "N/A"}
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

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
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

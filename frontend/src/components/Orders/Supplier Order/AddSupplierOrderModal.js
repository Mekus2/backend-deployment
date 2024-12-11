import React, { useState } from "react";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import { IoCloseCircle } from "react-icons/io5";
import {
  Field,
  Label,
  Input,
  OrderDetailsSection,
  Table,
  DeleteButton,
  TotalSection,
  TotalRow,
  TotalLabel,
  TotalValue,
  QuantityInput,
  SuggestionsList,
  SuggestionItem,
  SuggestionsContainer,
  SupplierSearchContainer,
  PIconButton,
  ButtonGroup,
} from "../OrderStyles";
import { FaPlus } from "react-icons/fa";
import useAddSupplierOrderModal from "../../../hooks/useAddSupplierOrderModal";
import { calculateTotalQuantity } from "../../../utils/CalculationUtils";
import { notify } from "../../Layout/CustomToast"; // Import the toast notification utility

const AddSupplierOrderModal = ({ onClose, onSave }) => {
  const {
    contactPersonName,
    setContactPersonName,
    contactPersonNumber,
    setContactPersonNumber,
    supplierCompanyName,
    setSupplierCompanyName,
    supplierCompanyNum,
    setSupplierCompanyNum,
    editable,
    supplierSearch,
    filteredSuppliers,
    orderDetails,
    productSearch,
    filteredProducts,
    currentEditingIndex,
    handleAddProduct,
    handleProductInputChange,
    handleProductSelect,
    handleSupplierInputChange,
    handleSupplierSelect,
    handleQuantityChange,
    handleRemoveProduct,
    handleAddSupplier,
    handleSave,
  } = useAddSupplierOrderModal(onSave, onClose);

  const [errors, setErrors] = useState({});
  const [inputStates, setInputStates] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!supplierCompanyName) newErrors.supplierCompanyName = true;
    if (!supplierCompanyNum) newErrors.supplierCompanyNum = true;
    if (!contactPersonName) newErrors.contactPersonName = true;
    if (!contactPersonNumber) newErrors.contactPersonNumber = true;

    if (!/^(0\d{10})?$/.test(contactPersonNumber)) {
      newErrors.contactPersonNumber = true;
    }
    if (!/^(0\d{10})?$/.test(supplierCompanyNum)) {
      newErrors.supplierCompanyNum = true;
    }

    orderDetails.forEach((detail, index) => {
      const productName = inputStates[index] || detail.productName || "";
      if (!productName.trim()) {
        newErrors[`productName${index}`] = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveWithValidation = async () => {
    if (validateFields()) {
      try {
        await handleSave(); // Wait for handleSave to complete
        notify.success("Order successfully created!"); // Success toast notification
      } catch (error) {
        // Display error toast if the save fails
        notify.error("Order not saved. Please try again.");
      }
    } else {
      notify.error("Please fill in all required fields."); // Error toast for empty fields
    }
  };

  const clearError = (field) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: undefined,
    }));
  };

  const handlePhoneNumberChange = (setterFunction, value) => {
    // Remove all non-numeric characters
    let sanitizedValue = value.replace(/[^0-9]/g, "");

    // Ensure the value starts with '0' if not empty and limit it to 11 digits
    if (sanitizedValue && sanitizedValue[0] !== "0") {
      sanitizedValue = "0" + sanitizedValue.slice(0, 10);
    }

    if (sanitizedValue.length > 11) {
      sanitizedValue = sanitizedValue.slice(0, 11); // Truncate to 11 digits
    }

    // Update the state with the sanitized value
    setterFunction(sanitizedValue);
  };

  const totalQuantity = calculateTotalQuantity(orderDetails);

  const handleAddSupplierWithNotification = () => {
    handleAddSupplier(); // Calls the function that adds the supplier
    notify.success("You can now add a new supplier!"); // Trigger the toast notification
  };

  return (
    <Modal title="Add Supplier Order" onClose={onClose}>
      <Field>
        <Label>Supplier Search</Label>
        <SupplierSearchContainer>
          <Input
            value={supplierSearch}
            onChange={(e) => handleSupplierInputChange(e.target.value)}
            placeholder="Search Supplier"
          />
          <PIconButton onClick={handleAddSupplierWithNotification}>
            <FaPlus className="icon" /> Supplier
          </PIconButton>
        </SupplierSearchContainer>
        {supplierSearch && filteredSuppliers.length > 0 && (
          <SuggestionsContainer>
            <SuggestionsList>
              {filteredSuppliers.map((supplier) => (
                <SuggestionItem
                  key={supplier.Supp_Company_Name}
                  onClick={() => handleSupplierSelect(supplier)}
                >
                  {supplier.Supp_Company_Name}
                </SuggestionItem>
              ))}
            </SuggestionsList>
          </SuggestionsContainer>
        )}
      </Field>
      <Field>
        <Label>
          Supplier Details{" "}
          {errors.supplierCompanyName && (
            <span style={{ color: "red" }}>*</span>
          )}
          {errors.supplierCompanyNum && <span style={{ color: "red" }}>*</span>}
        </Label>
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            value={supplierCompanyName}
            onChange={(e) => {
              setSupplierCompanyName(e.target.value);
              clearError("supplierCompanyName");
            }}
            placeholder="Supplier Name"
            style={{ flex: 1 }}
            disabled={!editable}
          />
          <Input
            value={supplierCompanyNum}
            onChange={(e) => {
              handlePhoneNumberChange(setSupplierCompanyNum, e.target.value);
              clearError("supplierCompanyNum");
            }}
            placeholder="Supplier Contact Number"
            style={{ flex: 1 }}
            disabled={!editable}
          />
        </div>
      </Field>

      <Field>
        <Label>
          Contact Person Details{" "}
          {errors.contactPersonName && <span style={{ color: "red" }}>*</span>}
          {errors.contactPersonNumber && (
            <span style={{ color: "red" }}>*</span>
          )}
        </Label>
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            value={contactPersonName}
            onChange={(e) => {
              setContactPersonName(e.target.value);
              clearError("contactPersonName");
            }}
            placeholder="Contact Person Name"
            style={{ flex: 1 }}
            disabled={!editable}
          />
          <Input
            value={contactPersonNumber}
            onChange={(e) => {
              handlePhoneNumberChange(setContactPersonNumber, e.target.value);
              clearError("contactPersonNumber");
            }}
            placeholder="Contact Person Number"
            style={{ flex: 1 }}
            disabled={!editable}
          />
        </div>
      </Field>

      <OrderDetailsSection>
        <h3>Order Details</h3>
        <Table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((orderDetail, index) => (
              <tr key={index}>
                <td>
                  <Input
                    style={{
                      display: "inline-block",
                      width: "calc(100% - 20px)",
                    }}
                    value={inputStates[index] || ""} // Controlled input value
                    onChange={(e) => {
                      const userInput = e.target.value;
                      setInputStates((prevStates) => ({
                        ...prevStates,
                        [index]: userInput,
                      }));
                      handleProductInputChange(index, userInput); // Trigger search and manual input handling
                      clearError(`productName${index}`);
                    }}
                    placeholder="Product Name"
                  />
                  {errors[`productName${index}`] && (
                    <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                  )}
                  {productSearch &&
                    index === currentEditingIndex &&
                    filteredProducts.length > 0 && (
                      <SuggestionsContainer>
                        <SuggestionsList>
                          {filteredProducts.map((product) => (
                            <SuggestionItem
                              key={product.id}
                              onClick={() => {
                                setInputStates((prevStates) => ({
                                  ...prevStates,
                                  [index]: product.PROD_NAME,
                                }));
                                handleProductSelect(index, product); // Select the product from suggestions
                              }}
                            >
                              {product.PROD_NAME}
                            </SuggestionItem>
                          ))}
                        </SuggestionsList>
                      </SuggestionsContainer>
                    )}
                </td>
                <td>
                  <QuantityInput
                    type="number"
                    value={orderDetail.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value, 10))
                    }
                  />
                </td>
                <td>
                  <DeleteButton onClick={() => handleRemoveProduct(index)}>
                    <IoCloseCircle className="icon" />
                  </DeleteButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <Button onClick={handleAddProduct}>Add Product</Button>
        </div>

        <TotalSection>
          <TotalRow
            style={{ display: "flex", alignItems: "left", marginLeft: "780px" }}
          >
            <TotalLabel>Total Quantity: </TotalLabel>
            <TotalValue>{totalQuantity}</TotalValue>
          </TotalRow>
        </TotalSection>
      </OrderDetailsSection>

      <ButtonGroup>
        <Button variant="red" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveWithValidation}>
          Add Order
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

export default AddSupplierOrderModal;

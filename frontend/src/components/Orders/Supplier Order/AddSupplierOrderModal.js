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
import { calculateTotalQuantity } from "../../../utils/CalculationUtils"; // Import total quantity calculation utility

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
      if (!detail.productName) {
        newErrors[`productName${index}`] = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveWithValidation = () => {
    if (validateFields()) {
      handleSave(); // Handle save, validate first
      alert("Order created successfully!"); // Show success message
    }
  };

  const clearError = (field) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: undefined,
    }));
  };

  const handlePhoneNumberChange = (setterFunction, value) => {
    let sanitizedValue = value.replace(/[^0-9]/g, "");
    if (sanitizedValue.length > 11) {
      sanitizedValue = sanitizedValue.slice(0, 11);
    }
    if (sanitizedValue && sanitizedValue[0] !== "0") {
      sanitizedValue = "0" + sanitizedValue.slice(0, 10);
    }
    setterFunction(sanitizedValue);
  };

  const totalQuantity = calculateTotalQuantity(orderDetails);

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
          <PIconButton onClick={handleAddSupplier}>
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
          Supplier Name{" "}
          {errors.supplierCompanyName && (
            <span style={{ color: "red" }}>*</span>
          )}
        </Label>
        <Input
          value={supplierCompanyName}
          onChange={(e) => {
            setSupplierCompanyName(e.target.value);
            clearError("supplierCompanyName");
          }}
          placeholder="Supplier Name"
          disabled={!editable}
        />
      </Field>
      <Field>
        <Label>
          Supplier Contact Number{" "}
          {errors.supplierCompanyNum && <span style={{ color: "red" }}>*</span>}
        </Label>
        <Input
          value={supplierCompanyNum}
          onChange={(e) => {
            handlePhoneNumberChange(setSupplierCompanyNum, e.target.value);
            clearError("supplierCompanyNum");
          }}
          placeholder="Supplier Contact Number"
          disabled={!editable}
        />
      </Field>
      <Field>
        <Label>
          Contact Person{" "}
          {errors.contactPersonName && <span style={{ color: "red" }}>*</span>}
        </Label>
        <Input
          value={contactPersonName}
          onChange={(e) => {
            setContactPersonName(e.target.value);
            clearError("contactPersonName");
          }}
          placeholder="Contact Person Name"
          disabled={!editable}
        />
      </Field>
      <Field>
        <Label>
          Contact Number{" "}
          {errors.contactPersonNumber && (
            <span style={{ color: "red" }}>*</span>
          )}
        </Label>
        <Input
          value={contactPersonNumber}
          onChange={(e) => {
            handlePhoneNumberChange(setContactPersonNumber, e.target.value);
            clearError("contactPersonNumber");
          }}
          placeholder="Contact Person Number"
          disabled={!editable}
        />
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
                    value={inputStates[index] || ""}
                    onChange={(e) => {
                      setInputStates((prevStates) => ({
                        ...prevStates,
                        [index]: e.target.value,
                      }));
                      handleProductInputChange(index, e.target.value);
                      clearError(`productName${index}`);
                    }}
                    placeholder="Product Name"
                  />
                  {errors[`productName${index}`] && (
                    <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                  )}
                  {productSearch && index === currentEditingIndex && (
                    <SuggestionsContainer>
                      {filteredProducts.length > 0 && (
                        <SuggestionsList>
                          {filteredProducts.map((product) => (
                            <SuggestionItem
                              key={product.id}
                              onClick={() => {
                                setInputStates((prevStates) => ({
                                  ...prevStates,
                                  [index]: product.PROD_NAME,
                                }));
                                handleProductSelect(index, product);
                              }}
                            >
                              {product.PROD_NAME}
                            </SuggestionItem>
                          ))}
                        </SuggestionsList>
                      )}
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
        <Button onClick={handleAddProduct} style={{ marginTop: "10px" }}>
          Add Product
        </Button>

        <TotalSection>
          <TotalRow>
            <TotalLabel>Total Quantity</TotalLabel>
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

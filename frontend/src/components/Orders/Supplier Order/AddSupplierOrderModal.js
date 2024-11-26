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
import {
  calculateTotalQuantity,
  calculateLineTotal,
} from "../../../utils/CalculationUtils";
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
    setOrderDetails,
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
    totalValue,
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
              <th>Qty</th>
              <th>Purchase Price</th> {/* New column for Purchase Price */}
              <th>Sell Price</th>
              <th>Discount (%)</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((orderDetail, index) => (
              <tr key={index}>
                <td style={{ position: "relative" }}>
                  <Input
                    style={{
                      display: "inline-block",
                      width: "calc(100% - 10px)",
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
                    <span
                      style={{
                        color: "red",
                        position: "absolute",
                        right: "-10px", // Adjust as needed for spacing
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      *
                    </span>
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
                    style={{
                      textAlign: "center", // Centering the input
                    }}
                    value={orderDetail.quantity}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value, 10);
                      handleQuantityChange(
                        index,
                        isNaN(quantity) ? 0 : quantity
                      );
                    }}
                    placeholder="Quantity"
                  />
                </td>

                {/* Purchase Price Input */}
                <td>
                  <Input
                    type="number"
                    style={{ textAlign: "center" }}
                    value={orderDetail.purchasePrice || ""}
                    onChange={(e) => {
                      const updatedOrderDetails = [...orderDetails];
                      updatedOrderDetails[index] = {
                        ...updatedOrderDetails[index],
                        purchasePrice: parseFloat(e.target.value) || 0, // Ensure number input
                      };
                      setOrderDetails(updatedOrderDetails);
                    }}
                    placeholder="Purchase Price"
                  />
                </td>

                <td>
                  <Input
                    type="text"
                    value={orderDetail.price || ""}
                    onChange={(e) => {
                      let value = e.target.value;

                      // Remove non-numeric characters except `.`
                      value = value.replace(/[^0-9.]/g, "");

                      // Prevent multiple leading zeros
                      if (value.startsWith("0") && !value.startsWith("0.")) {
                        value = value.replace(/^0+/, "");
                      }

                      // Ensure only one `.` is allowed
                      if (value.split(".").length > 2) {
                        value = value.substring(0, value.lastIndexOf("."));
                      }

                      const updatedOrderDetails = [...orderDetails];
                      updatedOrderDetails[index] = {
                        ...updatedOrderDetails[index],
                        price: value, // Keep the current cleaned input as string
                      };
                      setOrderDetails(updatedOrderDetails);
                    }}
                    onBlur={() => {
                      const updatedOrderDetails = [...orderDetails];
                      let price = orderDetail.price;

                      // Convert to fixed decimal if valid, otherwise keep it as an empty string
                      if (price && !isNaN(price)) {
                        price = parseFloat(price).toFixed(2);
                      } else {
                        price = ""; // Reset invalid input
                      }

                      updatedOrderDetails[index] = {
                        ...updatedOrderDetails[index],
                        price: price,
                      };
                      setOrderDetails(updatedOrderDetails);
                    }}
                    style={{ textAlign: "center" }}
                    placeholder="Sell Price"
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    style={{ textAlign: "center" }}
                    value={orderDetail.discount || ""}
                    onChange={(e) => {
                      const updatedOrderDetails = [...orderDetails];
                      updatedOrderDetails[index] = {
                        ...updatedOrderDetails[index],
                        discount: parseFloat(e.target.value) || 0, // Ensure number input
                      };
                      setOrderDetails(updatedOrderDetails);
                    }}
                    placeholder="Discount"
                  />
                </td>

                <td>₱{calculateLineTotal(orderDetail).toFixed(2)}</td>
                <td>
                  <DeleteButton onClick={() => handleRemoveProduct(index)}>
                    <IoCloseCircle />
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
          <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
            <TotalLabel>Total Qty: </TotalLabel>
            <TotalValue>{totalQuantity}</TotalValue>
          </TotalRow>
          <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
            <TotalLabel>Total Discount: </TotalLabel>
            <TotalValue>
              ₱
              {orderDetails
                .reduce((acc, detail) => {
                  // Calculate the discount based on the line's price, discount, and quantity
                  const discountValue =
                    (((parseFloat(detail.price) || 0) *
                      (parseFloat(detail.discount) || 0)) /
                      100) *
                    (parseInt(detail.quantity, 10) || 0);
                  return acc + discountValue;
                }, 0)
                .toFixed(2)}
            </TotalValue>
          </TotalRow>

          <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
            <TotalLabel>Total Revenue: </TotalLabel>
            <TotalValue style={{ color: "#f08400" }}>
              ₱{totalValue.toFixed(2)}
            </TotalValue>
          </TotalRow>
          <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
            <TotalLabel>Total Cost: </TotalLabel>
            <TotalValue style={{ color: "#ff5757" }}>
              ₱
              {orderDetails
                .reduce((acc, detail) => {
                  // Calculate the total cost as Purchase Price * Quantity
                  const totalCost =
                    (parseFloat(detail.purchasePrice) || 0) *
                    (parseInt(detail.quantity, 10) || 0);
                  return acc + totalCost;
                }, 0)
                .toFixed(2)}
            </TotalValue>
          </TotalRow>
          <TotalRow style={{ display: "flex", justifyContent: "flex-end" }}>
            <TotalLabel>Gross Profit: </TotalLabel>
            <TotalValue style={{ color: "#1DBA0B" }}>
              ₱
              {(
                orderDetails.reduce((acc, detail) => {
                  // Calculate Total Revenue for this line (Sell Price * Quantity)
                  const totalRevenue =
                    (parseFloat(detail.price) || 0) *
                    (parseInt(detail.quantity, 10) || 0);
                  return acc + totalRevenue;
                }, 0) -
                orderDetails.reduce((acc, detail) => {
                  // Calculate the total cost as Purchase Price * Quantity
                  const totalCost =
                    (parseFloat(detail.purchasePrice) || 0) *
                    (parseInt(detail.quantity, 10) || 0);
                  return acc + totalCost;
                }, 0)
              ).toFixed(2)}
            </TotalValue>
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

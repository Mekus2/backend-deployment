import React, { useState } from "react";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import styled from "styled-components";
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
  Select,
} from "../OrderStyles";
import { FaPlus } from "react-icons/fa";
import useAddCustomerOrderModal from "../../../hooks/useAddCustomerOrderModal";
import { calculateLineTotal } from "../../../utils/CalculationUtils";
import { notify } from "../../Layout/CustomToast"; // Import the toast notification utility
import "../../../styles.css";

const AddCustomerOrderModal = ({ onClose, onSave }) => {
  const {
    clientName,
    setClientName,
    clientCity,
    setClientCity,
    clientProvince,
    setClientProvince,
    clientNumber,
    setClientNumber,
    deliveryOption,
    setDeliveryOption,
    paymentTerms,
    setPaymentTerms,
    editable,
    clientSearch,
    filteredClients,
    orderDetails,
    productSearch,
    filteredProducts,
    currentEditingIndex,
    handleAddProduct,
    handleProductInputChange,
    handleProductSelect,
    handleClientInputChange,
    handleClientSelect,
    handleQuantityChange,
    handlePriceChange,
    handleSave,
    handleRemoveProduct,
    handleAddClient,
    totalQuantity,
    totalValue,
    setOrderDetails,
  } = useAddCustomerOrderModal(onSave, onClose);

  const [errors, setErrors] = useState({});
  const [inputStates, setInputStates] = useState({});

  const validateFields = () => {
    const newErrors = {};

    if (!clientName) newErrors.clientName = true;
    if (!clientCity) newErrors.clientCity = true;
    if (!clientProvince) newErrors.clientProvince = true;
    if (!deliveryOption) newErrors.deliveryOption = true;
    if (!paymentTerms) newErrors.paymentTerms = true;
    if (!clientNumber) newErrors.clientNumber = true;

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
        await handleSave(); // Assuming handleSave performs the API call and saves the order
        notify.success("Order successfully created!"); // Success toast notification
      } catch (error) {
        // In case of an error during save
        notify.error("Order not saved. Please try again."); // Error toast for unsuccessful saving
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
  const handleAddProductWithValidation = () => {
    // Check if any product name field is empty
    const hasEmptyProductName = orderDetails.some(
      (detail) => !detail.productName
    );

    if (hasEmptyProductName) {
      notify.error(
        "Please fill in all product names before adding a new product."
      ); // Show an error notification
      return;
    }

    // Call the original handleAddProduct function to add a new product
    handleAddProduct();
  };
  const handleAddClientWithNotification = () => {
    handleAddClient();
    notify.success("You can now add a new customer!"); // Add Client toast notification
  };
  const handleClientNumberChange = (value) => {
    // Remove non-numeric characters
    let sanitizedValue = value.replace(/\D/g, "");

    // Ensure it starts with '0' and is no longer than 11 digits
    if (sanitizedValue.length > 0 && !sanitizedValue.startsWith("0")) {
      sanitizedValue = "0" + sanitizedValue;
    }
    if (sanitizedValue.length > 11) {
      sanitizedValue = sanitizedValue.slice(0, 11);
    }

    setClientNumber(sanitizedValue);
    clearError("clientNumber");
  };

  return (
    <Modal title="Add Customer Order" onClose={onClose}>
      <Field>
        <Label>Customer Search</Label>
        <SupplierSearchContainer>
          <Input
            value={clientSearch}
            onChange={(e) => handleClientInputChange(e.target.value)}
            placeholder="Search Customer"
          />
          <PIconButton onClick={handleAddClientWithNotification}>
            <FaPlus className="icon" /> Customer
          </PIconButton>
        </SupplierSearchContainer>
        {clientSearch && filteredClients.length > 0 && (
          <SuggestionsContainer>
            <SuggestionsList>
              {filteredClients.map((client) => (
                <SuggestionItem
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                >
                  {client.name}
                </SuggestionItem>
              ))}
            </SuggestionsList>
          </SuggestionsContainer>
        )}
      </Field>

      <Field>
        <Label>
          Customer Details{" "}
          {errors.clientName && <span style={{ color: "red" }}>*</span>}
        </Label>
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              clearError("clientName");
            }}
            placeholder="Customer Name"
            disabled={!editable}
            style={{ flex: 1 }}
          />
          <Input
            value={clientNumber}
            onChange={(e) => handleClientNumberChange(e.target.value)}
            placeholder="Customer Number"
            disabled={!editable}
            style={{ flex: 1 }}
          />
        </div>
      </Field>

      <Field>
        <Label>Location</Label>
        <div style={{ display: "flex", gap: "10px", position: "relative" }}>
          <Input
            value={clientProvince}
            onChange={(e) => {
              setClientProvince(e.target.value);
              clearError("clientProvince");
            }}
            placeholder="Province"
            disabled={!editable}
            style={{ flex: 1 }}
          />
          {errors.clientProvince && (
            <span style={{ color: "red", marginLeft: "5px" }}>*</span>
          )}
          <Input
            value={clientCity}
            onChange={(e) => {
              setClientCity(e.target.value);
              clearError("clientCity");
            }}
            placeholder="City"
            disabled={!editable}
            style={{ flex: 1 }}
          />
          {errors.clientCity && (
            <span style={{ color: "red", marginLeft: "5px" }}>*</span>
          )}
        </div>
      </Field>

      <Field>
        <Label>
          Order Preferences{" "}
          {errors.deliveryOption && <span style={{ color: "red" }}>*</span>}
        </Label>
        <div style={{ display: "flex", gap: "10px" }}>
          <Select
            value={deliveryOption}
            onChange={(e) => {
              setDeliveryOption(e.target.value);
              clearError("deliveryOption");
            }}
            style={{ flex: 1 }}
          >
            <option value="">Select Delivery Option</option>
            <option value="pickup">Pickup</option>
            <option value="lbc">LBC</option>
            <option value="jnt">J&T Express</option>
            <option value="grab">Grab Express</option>
            <option value="courier">Courier Service</option>
          </Select>

          <Select
            value={paymentTerms}
            onChange={(e) => {
              setPaymentTerms(e.target.value);
              clearError("paymentTerms");
            }}
            style={{ flex: 1 }}
          >
            <option value="">Select Payment Terms</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="gcash">GCash</option>
            <option value="installment">Installment</option>
          </Select>
        </div>
      </Field>

      <OrderDetailsSection>
        <h3>Order Details</h3>
        <Table>
          <thead>
            <tr>
              <th style={{ minWidth: "300px", width: "auto" }}>Product Name</th>
              <th style={{ minWidth: "100px", width: "auto" }}>Qty</th>
              {/* <th>Purchase Price</th> New column for Purchase Price */}
              <th style={{ minWidth: "150px", width: "auto" }}>Sell Price</th>
              <th style={{ minWidth: "100px", width: "auto" }}>Discount (%)</th>
              <th style={{ minWidth: "100px", width: "auto" }}>Total</th>
              <th style={{ minWidth: "20px", width: "auto" }}></th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((orderDetail, index) => (
              <tr key={index}>
                <td style={{ position: "relative" }}>
                  <Input
                    style={{
                      display: "inline-block",
                      width: "100%",
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
                        width: "100%",
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
                {/* <td>
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
                </td> */}

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
                    style={{ textAlign: "center", width: "100%" }}
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
          <Button onClick={handleAddProductWithValidation}>Add Product</Button>
        </div>
        <TotalSummary>
          <TotalItem>
            <strong>Total Quantity:</strong> {totalQuantity}
          </TotalItem>

          <TotalItem>
            <strong>Total Discount: </strong>
            <HighlightedDiscount style={{ color: "red" }}>
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
            </HighlightedDiscount>
          </TotalItem>

          <TotalItem>
            <strong>Total Revenue: </strong>
            <HighlightedTotal style={{ color: "#1DBA0B" }}>
              ₱{totalValue.toFixed(2)}
            </HighlightedTotal>
          </TotalItem>
        </TotalSummary>
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


const TotalSummary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 20px;
  font-weight: bold;
`;

const TotalItem = styled.p`
  margin: 5px 0;
  font-size: 14px;
`;

const HighlightedTotal = styled.span`
  color: #1DBA0B;
  font-size: 16px;
`;

const HighlightedDiscount = styled.span`
  color: red;
  font-size: 16px;
`;

export default AddCustomerOrderModal;

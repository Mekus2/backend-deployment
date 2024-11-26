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
          Customer Name{" "}
          {errors.clientName && <span style={{ color: "red" }}>*</span>}
        </Label>
        <Input
          value={clientName}
          onChange={(e) => {
            setClientName(e.target.value);
            clearError("clientName");
          }}
          placeholder="Customer Name"
          disabled={!editable}
        />
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
          Delivery Option{" "}
          {errors.deliveryOption && <span style={{ color: "red" }}>*</span>}
        </Label>
        <Select
          value={deliveryOption}
          onChange={(e) => {
            setDeliveryOption(e.target.value);
            clearError("deliveryOption");
          }}
        >
          <option value="">Select Delivery Option</option>
          <option value="pickup">Pickup</option>
          <option value="lbc">LBC</option>
          <option value="jnt">J&T Express</option>
          <option value="grab">Grab Express</option>
          <option value="courier">Courier Service</option>
        </Select>
      </Field>

      <Field>
        <Label>
          Payment Terms{" "}
          {errors.paymentTerms && <span style={{ color: "red" }}>*</span>}
        </Label>
        <Select
          value={paymentTerms}
          onChange={(e) => {
            setPaymentTerms(e.target.value);
            clearError("paymentTerms");
          }}
        >
          <option value="">Select Payment Terms</option>
          <option value="cod">Cash on Delivery (COD)</option>
          <option value="gcash">GCash</option>
          <option value="installment">Installment</option>
        </Select>
      </Field>

      <OrderDetailsSection>
        <h3>Order Details</h3>
        <Table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
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
                    style={{
                      textAlign: "center", // Centered text
                    }}
                    placeholder="Price"
                  />
                </td>

                <td>
                  <Input
                    type="text"
                    value={orderDetail.discountValue || ""}
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
                        discountValue: value, // Keep the current cleaned input as string
                      };
                      setOrderDetails(updatedOrderDetails);
                    }}
                    onBlur={() => {
                      const updatedOrderDetails = [...orderDetails];
                      let discountValue = orderDetail.discountValue;

                      // Convert to fixed decimal if valid, otherwise keep it as an empty string
                      if (discountValue && !isNaN(discountValue)) {
                        discountValue = parseFloat(discountValue).toFixed(2);
                      } else {
                        discountValue = ""; // Reset invalid input
                      }

                      updatedOrderDetails[index] = {
                        ...updatedOrderDetails[index],
                        discountValue: discountValue,
                      };
                      setOrderDetails(updatedOrderDetails);
                    }}
                    style={{
                      textAlign: "center", // Centered text
                    }}
                    placeholder="Discount (%)"
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

        <Button onClick={handleAddProductWithValidation}>Add Product</Button>

        <TotalSection>
          <TotalRow>
            <TotalLabel>Total Quantity</TotalLabel>
            <TotalValue>{totalQuantity}</TotalValue>
          </TotalRow>
          <TotalRow>
            <TotalLabel>Total Discount</TotalLabel>
            <TotalValue style={{ color: "#ff5757" }}>
              ₱
              {orderDetails
                .reduce((acc, detail) => {
                  const discount =
                    ((detail.price * (detail.discountValue || 0)) / 100) *
                    detail.quantity;
                  return acc + discount;
                }, 0)
                .toFixed(2)}
            </TotalValue>
          </TotalRow>

          <TotalRow>
            <TotalLabel>Total Value</TotalLabel>
            <TotalValue style={{ color: "#1DBA0B" }}>
              ₱{totalValue.toFixed(2)}
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

export default AddCustomerOrderModal;

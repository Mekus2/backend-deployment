import React, { useState, useEffect } from "react";
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
import { notify } from "../../Layout/CustomToast";
import "../../../styles.css";

const EditCustomerOrderModal = ({ customerOrderDetails, onClose, onSave }) => {
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
    orderDetails,
    setOrderDetails,
    handleProductInputChange,
    handleQuantityChange,
    handlePriceChange,
    handleSave,
    handleRemoveProduct,
    handleAddProduct,
  } = useAddCustomerOrderModal(onSave, onClose);

  const [errors, setErrors] = useState({});

  // Populate modal fields with customer order details
  useEffect(() => {
    console.log("Customer Order Details: ", customerOrderDetails); // Debugging
    if (customerOrderDetails) {
      setClientName(customerOrderDetails.clientName || "");
      setClientCity(customerOrderDetails.clientCity || "");
      setClientProvince(customerOrderDetails.clientProvince || "");
      setClientNumber(customerOrderDetails.clientNumber || "");
      setDeliveryOption(customerOrderDetails.deliveryOption || "");
      setPaymentTerms(customerOrderDetails.paymentTerms || "");
      setOrderDetails(customerOrderDetails.orderDetails || []);
    }
  }, [customerOrderDetails]);
  

  const validateFields = () => {
    const newErrors = {};
    if (!clientName) newErrors.clientName = true;
    if (!clientCity) newErrors.clientCity = true;
    if (!clientProvince) newErrors.clientProvince = true;
    if (!clientNumber) newErrors.clientNumber = true;
    if (!deliveryOption) newErrors.deliveryOption = true;
    if (!paymentTerms) newErrors.paymentTerms = true;

    orderDetails.forEach((detail, index) => {
      if (!detail.productName) newErrors[`productName${index}`] = true;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveWithValidation = async () => {
    if (validateFields()) {
      try {
        await handleSave();
        notify.success("Order successfully updated!");
      } catch (error) {
        notify.error("Order not saved. Please try again.");
      }
    } else {
      notify.error("Please fill in all required fields.");
    }
  };

  return (
    <Modal title="Edit Customer Order" onClose={onClose}>
      <Field>
        <Label>Customer Name</Label>
        <Input
          value={clientName}
          onChange={(e) => {
            setClientName(e.target.value);
            setErrors((prev) => ({ ...prev, clientName: undefined }));
          }}
          placeholder="Customer Name"
        />
        {errors.clientName && <span style={{ color: "red" }}>*</span>}
      </Field>

      <Field>
        <Label>Location</Label>
        <div style={{ display: "flex", gap: "10px" }}>
          <Input
            value={clientProvince}
            onChange={(e) => {
              setClientProvince(e.target.value);
              setErrors((prev) => ({ ...prev, clientProvince: undefined }));
            }}
            placeholder="Province"
          />
          <Input
            value={clientCity}
            onChange={(e) => {
              setClientCity(e.target.value);
              setErrors((prev) => ({ ...prev, clientCity: undefined }));
            }}
            placeholder="City"
          />
        </div>
      </Field>

      <Field>
        <Label>Customer Number</Label>
        <Input
          value={clientNumber}
          onChange={(e) => {
            setClientNumber(e.target.value.replace(/\D/g, ""));
            setErrors((prev) => ({ ...prev, clientNumber: undefined }));
          }}
          placeholder="Customer Number"
        />
        {errors.clientNumber && <span style={{ color: "red" }}>*</span>}
      </Field>

      <Field>
        <Label>Delivery Option</Label>
        <Select
          value={deliveryOption}
          onChange={(e) => {
            setDeliveryOption(e.target.value);
            setErrors((prev) => ({ ...prev, deliveryOption: undefined }));
          }}
        >
          <option value="">Select Delivery Option</option>
          <option value="pickup">Pickup</option>
          <option value="lbc">LBC</option>
          <option value="jnt">J&T Express</option>
          <option value="grab">Grab Express</option>
          <option value="courier">Courier Service</option>
        </Select>
        {errors.deliveryOption && <span style={{ color: "red" }}>*</span>}
      </Field>

      <Field>
        <Label>Payment Terms</Label>
        <Select
          value={paymentTerms}
          onChange={(e) => {
            setPaymentTerms(e.target.value);
            setErrors((prev) => ({ ...prev, paymentTerms: undefined }));
          }}
        >
          <option value="">Select Payment Terms</option>
          <option value="cod">Cash on Delivery (COD)</option>
          <option value="gcash">GCash</option>
          <option value="installment">Installment</option>
        </Select>
        {errors.paymentTerms && <span style={{ color: "red" }}>*</span>}
      </Field>

      {/* Order Details Section */}
      <OrderDetailsSection>
        <h3>Order Details</h3>
        <Table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Qty</th>
              <th>Sell Price</th>
              <th>Discount (%)</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((orderDetail, index) => (
              <tr key={index}>
                <td>
                  <Input
                    value={orderDetail.productName || ""}
                    onChange={(e) => handleProductInputChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <QuantityInput
                    type="number"
                    value={orderDetail.quantity || ""}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value, 10) || 0)
                    }
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={orderDetail.price || ""}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                  />
                </td>
                <td>
                  <Input
                    type="number"
                    value={orderDetail.discount || ""}
                    onChange={(e) => {
                      const updatedOrderDetails = [...orderDetails];
                      updatedOrderDetails[index].discount =
                        parseFloat(e.target.value) || 0;
                      setOrderDetails(updatedOrderDetails);
                    }}
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
        <Button onClick={handleAddProduct}>Add Product</Button>
      </OrderDetailsSection>

      <ButtonGroup>
        <Button variant="red" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveWithValidation}>
          Update Order
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

export default EditCustomerOrderModal;

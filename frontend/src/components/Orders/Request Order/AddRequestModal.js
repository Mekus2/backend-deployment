import React, { useState } from "react";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import styled from "styled-components";
import { IoCloseCircle } from "react-icons/io5";
import {
  Field,
  Label,
  Input,
  DeleteButton,
  DescriptionBox,
  OrderDetailsSection,
  Table,
  QuantityInput,
  SuggestionsList,
  SuggestionItem,
  TotalSection,
  TotalRow,
  TotalLabel,
  TotalValue,
} from "../OrderStyles";
import {
  calculateLineTotal,
  calculateTotalQuantity,
  calculateTotalValue,
} from "../../../utils/CalculationUtils";
import productData from "../../../data/ProductData";

const AddRequestModal = ({ onClose, onSave }) => {
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [orderDetails, setOrderDetails] = useState([
    {
      productId: "",
      productName: "",
      price: 0,
      quantity: 1,
      lineTotal: 0,
    },
  ]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(
    productData.PRODUCT
  );
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

  // Error state
  const [errors, setErrors] = useState({
    clientName: "",
    description: "",
    orderDetails: "",
  });

  const handleAddProduct = () => {
    setOrderDetails([
      ...orderDetails,
      { productId: "", productName: "", price: 0, quantity: 1, lineTotal: 0 },
    ]);
  };

  const handleProductInputChange = (index, value) => {
    setCurrentEditingIndex(index);
    setProductSearch(value);
    const filtered = productData.PRODUCT.filter((product) =>
      product.PROD_NAME.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
    const updatedOrderDetails = [...orderDetails];
    updatedOrderDetails[index].productName = value;
    setOrderDetails(updatedOrderDetails);
  };

  const handleProductSelect = (index, product) => {
    const updatedOrderDetails = [...orderDetails];
    updatedOrderDetails[index].productId = product.PROD_ID;
    updatedOrderDetails[index].productName = product.PROD_NAME;
    updatedOrderDetails[index].price = productData.PRODUCT_DETAILS.find(
      (detail) => detail.PROD_DETAILS_CODE === product.PROD_DETAILS_CODE
    ).PROD_DETALS_PRICE;
    updatedOrderDetails[index].lineTotal = calculateLineTotal(
      updatedOrderDetails[index]
    );
    setOrderDetails(updatedOrderDetails);
    setProductSearch("");
    setFilteredProducts(productData.PRODUCT);
    setCurrentEditingIndex(null);
  };

  const handleQuantityChange = (index, value) => {
    const updatedOrderDetails = [...orderDetails];
    updatedOrderDetails[index].quantity = Math.max(1, value);
    updatedOrderDetails[index].lineTotal = calculateLineTotal(
      updatedOrderDetails[index]
    );
    setOrderDetails(updatedOrderDetails);
  };

  const handleSave = () => {
    // Validation for required fields
    let hasErrors = false;
    const newErrors = { clientName: "", description: "", orderDetails: "" };

    if (!clientName) {
      newErrors.clientName = "Client Name is required.";
      hasErrors = true;
    }
    if (!description) {
      newErrors.description = "Description is required.";
      hasErrors = true;
    }
    if (
      orderDetails.length === 0 ||
      orderDetails.some((detail) => !detail.productName)
    ) {
      newErrors.orderDetails = "At least one product must be added and named.";
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) return;

    const newRequest = {
      requestBy: clientName,
      description,
      requestDetails: orderDetails.map(({ lineTotal, ...rest }) => rest),
    };
    onSave(newRequest);
    onClose();
  };

  const handleRemoveProduct = (index) => {
    const updatedOrderDetails = [...orderDetails];
    updatedOrderDetails.splice(index, 1);
    setOrderDetails(updatedOrderDetails);
  };

  const totalQuantity = calculateTotalQuantity(orderDetails);
  const totalValue = calculateTotalValue(orderDetails);

  return (
    <Modal title="Add Request" onClose={onClose}>
      <Field>
        <Label>Client Name</Label>
        <Input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
        {errors.clientName && <ErrorText>{errors.clientName}</ErrorText>}
      </Field>
      <Field>
        <Label>Description</Label>
        <DescriptionBox
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && <ErrorText>{errors.description}</ErrorText>}
      </Field>
      <OrderDetailsSection>
        <h3>Products</h3>
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map((detail, index) => (
              <tr key={index}>
                <td>
                  <div style={{ position: "relative" }}>
                    <Input
                      value={detail.productName}
                      onChange={(e) =>
                        handleProductInputChange(index, e.target.value)
                      }
                      placeholder="Search / Filter product"
                    />
                    {currentEditingIndex === index && productSearch && (
                      <SuggestionsList>
                        {filteredProducts.map((product) => (
                          <SuggestionItem
                            key={product.PROD_ID}
                            onClick={() => handleProductSelect(index, product)}
                          >
                            {product.PROD_NAME}
                          </SuggestionItem>
                        ))}
                      </SuggestionsList>
                    )}
                  </div>
                </td>
                <td>₱{detail.price.toFixed(2)}</td>
                <td>
                  <QuantityInput
                    type="number"
                    min="1"
                    value={detail.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, Number(e.target.value))
                    }
                  />
                </td>
                <td>₱{detail.lineTotal.toFixed(2)}</td>
                <td>
                  <DeleteButton onClick={() => handleRemoveProduct(index)}>
                    <IoCloseCircle />
                  </DeleteButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {errors.orderDetails && <ErrorText>{errors.orderDetails}</ErrorText>}
        <Button variant="primary" onClick={handleAddProduct}>
          Add Another Product
        </Button>
        <TotalSection>
          <TotalRow>
            <TotalLabel>Total Quantity:</TotalLabel>
            <TotalValue>{totalQuantity}</TotalValue>
          </TotalRow>
          <TotalRow>
            <TotalLabel>Total:</TotalLabel>
            <TotalValue>₱{totalValue.toFixed(2)}</TotalValue>
          </TotalRow>
        </TotalSection>
      </OrderDetailsSection>
      <ButtonGroup>
        <Button variant="red" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Add Request
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

// Styled components
const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ErrorText = styled.div`
  color: red;
  font-size: 0.875rem;
  margin-top: 5px;
`;

export default AddRequestModal;

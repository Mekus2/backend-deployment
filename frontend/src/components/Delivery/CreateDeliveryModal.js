import React, { useState } from "react";
import styled from "styled-components";
import { IoCloseCircle } from "react-icons/io5";

const CreateDeliveryModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    deliveryDate: "",
    deliveryType: "",
    products: [{ productName: "", quantity: 1, price: 0 }],
    status: "Pending",
  });

  const handleInputChange = (e, index, field) => {
    const value = e.target.value;
    if (field === "products") {
      const updatedProducts = [...formData.products];
      updatedProducts[index][e.target.name] = value;
      setFormData({ ...formData, products: updatedProducts });
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        { productName: "", quantity: 1, price: 0 },
      ],
    });
  };

  const removeProduct = (index) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal>
        <CloseButton onClick={onClose}>
          <IoCloseCircle color="#ff5757" size={24} />
        </CloseButton>
        <Title>Create New Delivery</Title>
        <form onSubmit={handleSubmit}>
          <SectionTitle>Customer Information</SectionTitle>
          <Label>Customer Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange(e)}
            required
          />
          <Label>Email Address</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleInputChange(e)}
            required
          />
          <Label>Phone Number</Label>
          <Input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange(e)}
            required
          />

          <SectionTitle>Delivery Details</SectionTitle>
          <Label>Delivery Date</Label>
          <Input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={(e) => handleInputChange(e)}
            required
          />
          <Label>Delivery Type</Label>
          <Select
            name="deliveryType"
            value={formData.deliveryType}
            onChange={(e) => handleInputChange(e)}
            required
          >
            <option value="Supplier">Supplier</option>
            <option value="Return">Return</option>
            <option value="Refund">Refund</option>
          </Select>

          <SectionTitle>Products</SectionTitle>
          {formData.products.map((product, index) => (
            <ProductRow key={index}>
              <div>
                <Label>Product Name</Label>
                <Input
                  type="text"
                  name="productName"
                  value={product.productName}
                  onChange={(e) => handleInputChange(e, index, "products")}
                  required
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  name="quantity"
                  value={product.quantity}
                  onChange={(e) => handleInputChange(e, index, "products")}
                  required
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={(e) => handleInputChange(e, index, "products")}
                  required
                />
              </div>
              <RemoveButton onClick={() => removeProduct(index)}>
                <IoCloseCircle color="#ff5757" size={20} />
              </RemoveButton>
            </ProductRow>
          ))}
          <AddProductButton onClick={addProduct}>Add Product</AddProductButton>

          <SectionTitle>Delivery Summary</SectionTitle>
          <SummaryRow>
            <Label>Subtotal</Label>
            <SummaryValue>
              {formData.products.reduce(
                (acc, product) => acc + product.price * product.quantity,
                0
              )}
            </SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <Label>Tax</Label>
            <SummaryValue>
              {(
                formData.products.reduce(
                  (acc, product) => acc + product.price * product.quantity,
                  0
                ) * 0.1
              ).toFixed(2)}
            </SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <Label>Total</Label>
            <SummaryValue>
              {(
                formData.products.reduce(
                  (acc, product) => acc + product.price * product.quantity,
                  0
                ) * 1.1
              ).toFixed(2)}
            </SummaryValue>
          </SummaryRow>

          <SectionTitle>Delivery Status</SectionTitle>
          <Label>Status</Label>
          <Select
            name="status"
            value={formData.status}
            onChange={(e) => handleInputChange(e)}
            required
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>

          <Actions>
            <SaveButton type="submit">Save Delivery</SaveButton>
            <CancelButton onClick={onClose}>Cancel</CancelButton>
          </Actions>
        </form>
      </Modal>
    </Backdrop>
  );
};

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 95%;
  max-width: 500px;
  max-height: 90%;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  cursor: pointer;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ProductRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;

  > div {
    flex: 1;
    &:not(:last-child) {
      margin-right: 10px;
    }
  }
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  align-self: center;
`;

const AddProductButton = styled.button`
  background: #00c4ff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  &:hover {
    background: #0082aa;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const SummaryValue = styled.span`
  font-weight: bold;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const SaveButton = styled.button`
  background: green;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  margin-right: 10px;
  &:hover {
    background: darkgreen;
  }
`;

const CancelButton = styled.button`
  background: #ff5757;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  margin-left: 10px;
  &:hover {
    background: #e52424;
  }
`;

export default CreateDeliveryModal;

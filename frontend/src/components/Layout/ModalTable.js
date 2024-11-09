// src/components/ModalTable.js

import React from "react";
import styled from "styled-components";
import { IoCloseCircle } from "react-icons/io5";
import { colors } from "../../colors";

const ModalTable = ({
  orderDetails,
  products,
  handleProductChange,
  handleQuantityChange,
  handleDiscountChange,
  handleRemoveProduct,
  handleAddProduct,
  totalQuantity,
  totalValue,
}) => (
  <OrderDetailsSection>
    <h3>Products</h3>
    <Table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Discount</th>
          <th>Total</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {orderDetails.map((detail, index) => (
          <tr key={index}>
            <td>
              <Select
                value={detail.productId}
                onChange={(e) =>
                  handleProductChange(index, "productId", e.target.value)
                }
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </td>
            <td>{`₱${detail.price.toFixed(2)}`}</td>
            <td>
              <Input
                type="number"
                min="1"
                value={detail.quantity}
                onChange={(e) =>
                  handleQuantityChange(index, Number(e.target.value))
                }
              />
            </td>
            <td>
              <DiscountContainer>
                <DiscountInput
                  type="number"
                  value={detail.discountValue}
                  onChange={(e) =>
                    handleDiscountChange(
                      index,
                      "discountValue",
                      Number(e.target.value)
                    )
                  }
                />
                <DiscountSelect
                  value={detail.discountType}
                  onChange={(e) =>
                    handleDiscountChange(index, "discountType", e.target.value)
                  }
                >
                  <option value="amount">Amount</option>
                  <option value="percent">%</option>
                </DiscountSelect>
              </DiscountContainer>
            </td>
            <td>{`₱${detail.lineTotal.toFixed(2)}`}</td>
            <td>
              <DeleteButton onClick={() => handleRemoveProduct(index)}>
                <IoCloseCircle />
              </DeleteButton>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
    <AddProductButton onClick={handleAddProduct}>
      Add Another Product
    </AddProductButton>
    <TotalSection>
      <TotalRow>
        <TotalLabel>Total Quantity:</TotalLabel>
        <TotalValue>{totalQuantity}</TotalValue>
      </TotalRow>
      <TotalRow>
        <TotalLabel>Subtotal:</TotalLabel>
        <TotalValue>{`₱${totalValue.toFixed(2)}`}</TotalValue>
      </TotalRow>
    </TotalSection>
  </OrderDetailsSection>
);

// Styled Components for ModalTable

const OrderDetailsSection = styled.div`
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    padding: 8px;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: ${colors.primary};
    color: white;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1em;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1em;
`;

const DiscountContainer = styled.div`
  display: flex;
  align-items: center;
`;

const DiscountInput = styled.input`
  width: 50%;
  padding: 5px;
  margin-right: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const DiscountSelect = styled.select`
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const AddProductButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: red;
`;

const TotalSection = styled.div`
  margin-top: 20px;
  text-align: right;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const TotalLabel = styled.span`
  font-weight: bold;
`;

const TotalValue = styled.span`
  font-weight: bold;
`;

export default ModalTable;

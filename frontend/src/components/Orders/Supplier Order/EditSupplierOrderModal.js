import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import { getProductByName } from "../../../api/fetchProducts";
import { IoCloseCircle } from "react-icons/io5"; // Importing the icon
import {
  Table,
  TableWrapper,
  TableHeader,
  TableRow,
  TableCell,
  Section,
  ButtonGroup,
  InputField,
} from "../OrderStyles";

// Styled components for suggestions
const SuggestionsContainer = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
  z-index: 10;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SuggestionItem = styled.li`
  padding: 8px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: red;
  font-size: 1.5rem;
`;

const TotalSummary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 20px;
  font-weight: bold;
`;

const SummaryItem = styled.div`
  margin-top: 10px;
`;

const EditSupplierOrderModal = ({ orderDetails, onClose }) => {
  const [inputStates, setInputStates] = useState([]);
  const [productSearch, setProductSearch] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

  useEffect(() => {
    if (orderDetails.length > 0) {
      setInputStates(
        orderDetails.map((detail) => ({
          productName: detail.PURCHASE_ORDER_DET_PROD_NAME,
          quantity: detail.PURCHASE_ORDER_DET_PROD_LINE_QTY,
        }))
      );
    }
  }, [orderDetails]);

  const handleProductInputChange = async (index, value) => {
    setInputStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index].productName = value;
      return newStates;
    });

    if (value.trim() === "") {
      setProductSearch(false);
      return;
    }

    setProductSearch(true);
    const products = await getProductByName(value);
    setFilteredProducts(products);
    setCurrentEditingIndex(index);
  };

  const handleProductSelect = (index, product) => {
    setInputStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index].productName = product.PROD_NAME;
      return newStates;
    });

    setProductSearch(false);
  };

  const handleRemoveProduct = (index) => {
    setInputStates((prevStates) => {
      const newStates = [...prevStates];
      newStates.splice(index, 1);
      return newStates;
    });
  };

  const totalQuantity = orderDetails.reduce(
    (total, detail) => total + (detail.PURCHASE_ORDER_DET_PROD_LINE_QTY || 0),
    0
  );

  // Ensure orderDetails is not empty and the necessary data is available
  const orderData = orderDetails[0]; // Assuming the first detail object contains all necessary order data

  return (
    <Modal title="Edit Supplier Order" status="Pending" onClose={onClose}>
      {/* Order details display above the table */}
      {orderData && (
        <Section>
          <p>
            <strong>Order ID:</strong> {orderData.PURCHASE_ORDER_ID}
          </p>
          <p>
            <strong>Order Created Date:</strong>{" "}
            {new Date(orderData.PURCHASE_ORDER_DATE_CREATED).toLocaleDateString()}
          </p>
          <p>
            <strong>Supplier ID:</strong> {orderData.PURCHASE_ORDER_SUPPLIER_ID}
          </p>
          <p>
            <strong>Supplier Name:</strong>{" "}
            {orderData.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME}
          </p>
        </Section>
      )}

      {/* Product details editable table */}
      <Section>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Product Name</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader></TableHeader>
              </tr>
            </thead>
            <tbody>
              {orderDetails.length > 0 ? (
                orderDetails.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <InputField
                        value={
                          inputStates[index]?.productName ||
                          detail.PURCHASE_ORDER_DET_PROD_NAME
                        }
                        onChange={(e) =>
                          handleProductInputChange(index, e.target.value)
                        }
                        placeholder="Product Name"
                      />
                      {productSearch && index === currentEditingIndex && (
                        <SuggestionsContainer>
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
                        </SuggestionsContainer>
                      )}
                    </TableCell>
                    <TableCell>
                      <InputField
                        type="number"
                        value={
                          inputStates[index]?.quantity ||
                          detail.PURCHASE_ORDER_DET_PROD_LINE_QTY
                        }
                        onChange={(e) =>
                          setInputStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index].quantity = e.target.value;
                            return newStates;
                          })
                        }
                        placeholder="Quantity"
                      />
                    </TableCell>
                    <TableCell>
                      <DeleteButton onClick={() => handleRemoveProduct(index)}>
                        <IoCloseCircle />
                      </DeleteButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>No order details available.</TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </Section>

      {/* Total Quantity display below the table */}
      <TotalSummary>
        <SummaryItem>
          <strong>Total Quantity:</strong> {totalQuantity}
        </SummaryItem>
      </TotalSummary>

      {/* Button Group */}
      <ButtonGroup>
        <Button variant="red" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            alert("Order update functionality is not yet implemented.")
          }
        >
          Save Update
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

export default EditSupplierOrderModal;

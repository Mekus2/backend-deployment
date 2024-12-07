import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { IoCloseCircle } from "react-icons/io5"; // Importing the icon
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import { fetchOrderDetailsById } from "../../../api/fetchCustomerOrders";
import { getProductByName } from "../../../api/fetchProducts";
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

const Header = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  background-color: #f4f4f4;
  border-bottom: 1px solid #ddd;
`;

const EditCustomerOrderModal = ({ order, onClose }) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputStates, setInputStates] = useState([]);
  const [productSearch, setProductSearch] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const details = await fetchOrderDetailsById(order.SALES_ORDER_ID);
        setOrderDetails(details);
        setInputStates(
          details.map((detail) => ({
            productName: detail.SALES_ORDER_PROD_NAME,
            quantity: detail.SALES_ORDER_LINE_QTY,
            purchasePrice: detail.SALES_ORDER_LINE_PURCHASE_PRICE,
            sellPrice: detail.SALES_ORDER_LINE_PRICE,
            discount: detail.SALES_ORDER_LINE_DISCOUNT,
          }))
        );
      } catch (err) {
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    if (order?.SALES_ORDER_ID) {
      fetchDetails();
    }
  }, [order]);

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return "₱0.00";
    return `₱${numericAmount.toFixed(2)}`;
  };

  const calculateLineTotal = (line) => {
    const price = parseFloat(line.SALES_ORDER_LINE_PRICE) || 0;
    const quantity = parseInt(line.SALES_ORDER_LINE_QTY) || 0;
    const discount = parseFloat(line.SALES_ORDER_LINE_DISCOUNT) || 0;
    const total = price * quantity * (1 - discount / 100);
    return total.toFixed(2);
  };

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

  const handleAddProduct = () => {
    setOrderDetails((prevDetails) => {
      const newProduct = {
        SALES_ORDER_PROD_NAME: "",
        SALES_ORDER_LINE_QTY: 0,
        SALES_ORDER_LINE_PURCHASE_PRICE: 0,
        SALES_ORDER_LINE_PRICE: 0,
        SALES_ORDER_LINE_DISCOUNT: 0,
      };
      setInputStates((prevStates) => [
        ...prevStates,
        {
          productName: "",
          quantity: 0,
          purchasePrice: 0,
          sellPrice: 0,
          discount: 0,
        },
      ]);
      return [...prevDetails, newProduct];
    });
  };

  const handleRemoveProduct = (index) => {
    setOrderDetails((prevDetails) => {
      const newDetails = [...prevDetails];
      newDetails.splice(index, 1);
      return newDetails;
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Modal
      title="Edit Customer Order"
      status={order.SALES_ORDER_STATUS}
      onClose={onClose}
    >
      <Section>
        <p>
          <strong>Order ID:</strong> {order.SALES_ORDER_ID}
        </p>
        <p>
          <strong>Order Created Date:</strong>{" "}
          {new Date(order.SALES_ORDER_DATE_CREATED).toLocaleDateString()}
        </p>
        <p>
          <strong>Delivery Option:</strong> {order.SALES_ORDER_DLVRY_OPTION}
        </p>
        <p>
          <strong>Client:</strong> {order.SALES_ORDER_CLIENT_NAME}
        </p>
        <p>
          <strong>City:</strong> {order.SALES_ORDER_CLIENT_CITY}
        </p>
        <p>
          <strong>Province:</strong> {order.SALES_ORDER_CLIENT_PROVINCE}
        </p>
      </Section>

      <Section>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Product Name</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader>Purchase Price</TableHeader>
                <TableHeader>Sell Price</TableHeader>
                <TableHeader>Discount</TableHeader>
                <TableHeader>Total</TableHeader>
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
                          detail.SALES_ORDER_PROD_NAME ||
                          ""
                        }
                        onChange={(e) =>
                          handleProductInputChange(index, e.target.value)
                        }
                        placeholder="Product Name"
                      />
                    </TableCell>
                    <TableCell>
                      <InputField
                        type="number"
                        value={
                          inputStates[index]?.quantity ||
                          detail.SALES_ORDER_LINE_QTY ||
                          0
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
                      <InputField
                        type="number"
                        value={
                          inputStates[index]?.purchasePrice ||
                          detail.SALES_ORDER_LINE_PURCHASE_PRICE ||
                          0
                        }
                        onChange={(e) =>
                          setInputStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index].purchasePrice = e.target.value;
                            return newStates;
                          })
                        }
                        placeholder="Purchase Price"
                      />
                    </TableCell>
                    <TableCell>
                      <InputField
                        type="number"
                        value={
                          inputStates[index]?.sellPrice ||
                          detail.SALES_ORDER_LINE_PRICE ||
                          0
                        }
                        onChange={(e) =>
                          setInputStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index].sellPrice = e.target.value;
                            return newStates;
                          })
                        }
                        placeholder="Sell Price"
                      />
                    </TableCell>
                    <TableCell>
                      <InputField
                        type="number"
                        value={
                          inputStates[index]?.discount ||
                          detail.SALES_ORDER_LINE_DISCOUNT ||
                          0
                        }
                        onChange={(e) =>
                          setInputStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index].discount = e.target.value;
                            return newStates;
                          })
                        }
                        placeholder="Discount"
                      />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(calculateLineTotal(detail))}
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
                  <TableCell colSpan={7}>No order details available.</TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableWrapper>
        <ButtonWrapper>
          <Button variant="primary" onClick={handleAddProduct}>
            Add Product
          </Button>
        </ButtonWrapper>
      </Section>

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

export default EditCustomerOrderModal;

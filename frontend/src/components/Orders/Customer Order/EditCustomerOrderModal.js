import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { IoCloseCircle } from "react-icons/io5"; // Importing the icon
import Modal from "../../Layout/Modal";
import Button from "../../Layout/Button";
import {
  fetchOrderDetailsById,
  updateOrderDetails,
} from "../../../api/fetchCustomerOrders";
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
  const [productSearchStates, setProductSearchStates] = useState({});
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

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

  // Debounced product search function
  const handleProductInputChange = (index, value) => {
    console.log(`Input changed at index ${index}: ${value}`); // Log the input change
    setCurrentEditingIndex(index);

    // Update product search state for each index
    setProductSearchStates((prevStates) => ({
      ...prevStates,
      [index]: value, // Store product search query per row
    }));

    // Update inputStates for the specific index
    setInputStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = {
        ...newStates[index], // Keep the other state values intact
        productName: value, // Update only the productName
      };
      return newStates;
    });

    // Clear previous timeout to avoid multiple fetches
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      console.log("Cleared previous debounce timeout");
    }

    // Set a new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      console.log(`Fetching products for: ${value}`);
      fetchFilteredProducts(value); // Use the search value for fetching products
    }, 800);
  };

  const fetchFilteredProducts = async (searchValue) => {
    console.log(`Starting fetch for: ${searchValue}`); // Log the fetch initiation
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log("Aborted previous fetch request"); // Log abort action
      }

      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;

      console.log("Calling API to get products..."); // Log API call initiation
      const fetchedProducts = await getProductByName(
        searchValue,
        newAbortController.signal
      );

      console.log("Fetched products:", fetchedProducts); // Log the fetched products

      const lowerCaseValue = searchValue.toLowerCase();
      const filtered = fetchedProducts
        .filter((product) =>
          product.PROD_NAME.toLowerCase().includes(lowerCaseValue)
        )
        .sort((a, b) => {
          const aStartsWith =
            a.PROD_NAME.toLowerCase().startsWith(lowerCaseValue);
          const bStartsWith =
            b.PROD_NAME.toLowerCase().startsWith(lowerCaseValue);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.PROD_NAME.localeCompare(b.PROD_NAME);
        });

      console.log("Filtered and sorted products:", filtered); // Log filtered products
      setFilteredProducts(filtered);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch aborted"); // Log abort error
      } else {
        console.error("Failed to fetch products:", error); // Log general fetch failure
      }
    }
  };

  const handleProductSelect = (index, product) => {
    setInputStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = {
        ...newStates[index],
        productName: product.PROD_NAME, // Map the fields correctly
        sellPrice: product.PROD_DETAILS["PROD_DETAILS_PURCHASE_PRICE"],
      };
      return newStates;
    });

    setOrderDetails((prevDetails) => {
      const newDetails = [...prevDetails];
      newDetails[index] = {
        ...newDetails[index],
        SALES_ORDER_PROD_ID: product.id,
        SALES_ORDER_PROD_NAME: product.PROD_NAME,
        SALES_ORDER_LINE_PRICE:
          product.PROD_DETAILS["PROD_DETAILS_PURCHASE_PRICE"],
      };
      return newDetails;
    });

    // Close the suggestion list for the specific index
    setProductSearchStates((prevStates) => ({
      ...prevStates,
      [index]: false, // Explicitly set this index to false to close the suggestion list
    }));
  };

  const handleAddProduct = () => {
    setOrderDetails((prevDetails) => {
      const newProduct = {
        SALES_ORDER_PROD_ID: 0,
        SALES_ORDER_PROD_NAME: "", // This field needs to match with the `inputStates`
        SALES_ORDER_LINE_QTY: 0,
        SALES_ORDER_LINE_PRICE: 0, // Make sure you're adding the right fields
        SALES_ORDER_LINE_PURCHASE_PRICE: 0,
        SALES_ORDER_LINE_DISCOUNT: 0,
        SALES_ORDER_LINE_TOTAL: 0,
      };

      setInputStates((prevStates) => [
        ...prevStates,
        {
          productName: "", // This matches with `SALES_ORDER_PROD_NAME`
          quantity: 0,
          sellPrice: 0,
          purchasePrice: 0,
          discount: 0,
        },
      ]);
      console.log("Updated Order Details after add Product:", orderDetails);
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
                    <TableCell style={{ position: "relative" }}>
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
                      {productSearchStates[index] &&
                        filteredProducts.length > 0 && (
                          <SuggestionsContainer>
                            <SuggestionsList>
                              {filteredProducts.map((product) => (
                                <SuggestionItem
                                  key={product.PROD_ID}
                                  onClick={() =>
                                    handleProductSelect(index, product)
                                  }
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
                          detail.SALES_ORDER_LINE_QTY ||
                          0
                        }
                        onChange={(e) => {
                          const newQuantity = e.target.value;
                          console.log(
                            `Updating Quantity for index ${index}:`,
                            newQuantity
                          );

                          setInputStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index].quantity = newQuantity;
                            return newStates;
                          });

                          // Update orderDetails to reflect the change in quantity and recalculate the line total
                          setOrderDetails((prevDetails) => {
                            const newDetails = [...prevDetails];
                            newDetails[index].SALES_ORDER_LINE_QTY =
                              newQuantity;
                            newDetails[index].SALES_ORDER_LINE_TOTAL =
                              calculateLineTotal(newDetails[index]); // Recalculate line total
                            console.log(
                              `Updated orderDetails (Quantity) for index ${index}:`,
                              newDetails[index]
                            );
                            return newDetails;
                          });
                        }}
                        placeholder="Quantity"
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
                        onChange={(e) => {
                          const newSellPrice = e.target.value;
                          console.log(
                            `Updating Sell Price for index ${index}:`,
                            newSellPrice
                          );

                          setInputStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index].sellPrice = newSellPrice;
                            return newStates;
                          });

                          // Update orderDetails to reflect the change in sell price and recalculate the line total
                          setOrderDetails((prevDetails) => {
                            const newDetails = [...prevDetails];
                            newDetails[index].SALES_ORDER_LINE_PRICE =
                              newSellPrice;
                            newDetails[index].SALES_ORDER_LINE_TOTAL =
                              calculateLineTotal(newDetails[index]); // Recalculate line total
                            console.log(
                              `Updated orderDetails (Sell Price) for index ${index}:`,
                              newDetails[index]
                            );
                            return newDetails;
                          });
                        }}
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
                        onChange={(e) => {
                          const newDiscount = e.target.value;
                          console.log(
                            `Updating Discount for index ${index}:`,
                            newDiscount
                          );

                          setInputStates((prevStates) => {
                            const newStates = [...prevStates];
                            newStates[index].discount = newDiscount;
                            return newStates;
                          });

                          // Update orderDetails to reflect the change in discount and recalculate the line total
                          setOrderDetails((prevDetails) => {
                            const newDetails = [...prevDetails];
                            newDetails[index].SALES_ORDER_LINE_DISCOUNT =
                              newDiscount;
                            newDetails[index].SALES_ORDER_LINE_TOTAL =
                              calculateLineTotal(newDetails[index]); // Recalculate line total
                            console.log(
                              `Updated orderDetails (Discount) for index ${index}:`,
                              newDetails[index]
                            );
                            return newDetails;
                          });
                        }}
                        placeholder="Discount"
                      />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(calculateLineTotal(detail))}{" "}
                      {/* Display the recalculated line total */}
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
          onClick={async () => {
            // Call the updateOrderDetails function and await the result
            const salesOrderId = order.SALES_ORDER_ID;
            console.log("Order Details Passed:", orderDetails);
            console.log("Order ID:", salesOrderId);
            const isUpdateSuccessful = await updateOrderDetails(
              salesOrderId,
              orderDetails
            );

            // Show appropriate alert based on whether the update was successful
            if (isUpdateSuccessful) {
              alert("Sales Order updated successfully!");
              // Reload the page after successful update
              window.location.reload();
            } else {
              alert("Failed to update Sales Order.");
              // Reload the page after failure
              window.location.reload();
            }
          }}
        >
          Save Update
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

export default EditCustomerOrderModal;

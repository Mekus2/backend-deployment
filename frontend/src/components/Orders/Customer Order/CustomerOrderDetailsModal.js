import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import { colors } from "../../../colors";
import Button from "../../Layout/Button"; // Ensure you import the Button component

// Import api functions
import { fetchOrderDetailsById } from "../../../api/fetchCustomerOrders";
import { addNewCustomerDelivery } from "../../../api/CustomerDeliveryApi"; // Assume there's an API to handle customer deliveries

const CustomerOrderDetailsModal = ({ order, onClose, userRole }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // State to toggle edit mode
  const [suggestions, setSuggestions] = useState([]);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchDetails = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (order.SALES_ORDER_ID) {
        setLoading(true);
        setError(null);
        try {
          const details = await fetchOrderDetailsById(
            order.SALES_ORDER_ID,
            controller.signal
          );
          setOrderDetails(details);
        } catch (err) {
          if (err.name === "AbortError") {
            console.log("Fetch aborted");
          } else {
            setError("Failed to fetch order details.");
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [order, userRole]);

  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return "₱0.00";
    }
    return `₱${numericAmount.toFixed(2)}`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!orderDetails) return null;
  if (!order) return null;

  const totalQuantity = orderDetails.reduce(
    (total, detail) => total + (detail.SALES_ORDER_LINE_QTY || 0),
    0
  );

  const calculateLineTotal = (line) => {
    const price = parseFloat(line.SALES_ORDER_LINE_PRICE) || 0;
    const quantity = parseInt(line.SALES_ORDER_LINE_QTY) || 0;
    const discount = parseFloat(line.SALES_ORDER_LINE_DISCOUNT) || 0;

    // Calculate total: (Qty * Price) - (Qty * Price * Discount)
    const total = price * quantity * (1 - discount / 100);
    return total.toFixed(2); // Ensure it's returned as a string with two decimals
  };

  // Update the total amount calculation logic to sum the calculated totals for each line
  const totalAmount = orderDetails.reduce((total, detail) => {
    const lineTotal = calculateLineTotal(detail);
    return total + parseFloat(lineTotal);
  }, 0);

  const handleLineUpdate = (index, field, value) => {
    const updatedDetails = [...orderDetails];
    updatedDetails[index][field] = value;
    updatedDetails[index].SALES_ORDER_LINE_TOTAL = calculateLineTotal(
      updatedDetails[index]
    );
    setOrderDetails(updatedDetails);
  };

  const totalDiscount = orderDetails.reduce(
    (total, detail) =>
      total +
      (parseFloat(detail.SALES_ORDER_LINE_PRICE) *
        parseInt(detail.SALES_ORDER_LINE_QTY) *
        (parseFloat(detail.SALES_ORDER_LINE_DISCOUNT) / 100) || 0),
    0
  );
  const handleAcceptOrder = async () => {
    const newDelivery  = {
      SALES_ORDER_ID: order.SALES_ORDER_ID,
      OUTBOUND_DEL_CUSTOMER_NAME: order.SALES_ORDER_CLIENT_NAME,
      OUTBOUND_DEL_DLVRY_OPTION: order.SALES_ORDER_DLVRY_OPTION,
      OUTBOUND_DEL_CITY: order.SALES_ORDER_CLIENT_CITY,
      OUTBOUND_DEL_PROVINCE: order.SALES_ORDER_CLIENT_PROVINCE,
      OUTBOUND_DEL_ACCPTD_BY_USER: userId,
      details: orderDetails.map((detail) => ({
        OUTBOUND_DETAILS_PROD_NAME: detail.SALES_ORDER_PROD_NAME,
        OUTBOUND_DETAILS_PROD_QTY: detail.SALES_ORDER_LINE_QTY,
        OUTBOUND_DETAILS_LINE_PRICE: detail.SALES_ORDER_LINE_PRICE,
      })),
    };
    try {
      const response = await addNewCustomerDelivery(newDelivery);
      logAcceptOrder(newDelivery);
      if (response) {
        alert("Customer delivery accepted");
      } else {
        alert("Customer delivery rejected");
      }
    } catch (err) {
      alert("An error occurred while accepting the order.");
    } finally {
      onClose();
      window.location.reload();
    }
  };

  const handleCancelOrder = () => {
    console.log("Order cancelled");
    onClose();
  };


  const logAcceptOrder = async (newOrderDelivery) => {
    const userId = localStorage.getItem("user_id"); // Ensure "user_id" is correctly stored in localStorage
    console.log("User ID:", userId);
    try {
      // Fetch the user details using the userId
      const userResponse = await fetch(`http://127.0.0.1:8000/account/logs/${userId}/`);
      if (!userResponse.ok) {
        throw new Error("Failed to fetch user details");
      }
  
      const user = await userResponse.json(); // Assuming the response contains the user object
      const username = user.username;
      
      const salesId = newOrderDelivery.SALES_ORDER_ID;
      // Construct the log payload
      const logPayload = {
        LLOG_TYPE: "Transaction logs",
        LOG_DESCRIPTION: `${username} accepted the customer order ID: (${salesId})`,
        USER_ID: userId,
      };
  
      // Send the log payload
      const logResponse = await fetch("http://127.0.0.1:8000/logs/logs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logPayload),
      });
  
      if (logResponse.ok) {
        console.log("Order log successfully created:", logPayload);
      } else {
        console.error("Failed to create order log:", logResponse);
      }
    } catch (error) {
      console.error("Error logging order acceptance:", error);
    }
  };

  const handleUpdateOrder = () => {
    setIsEditMode(true); // Toggle edit mode
  };

  const handleSaveOrder = () => {
    // Add the save functionality here if you have the backend set up
    console.log("Save order functionality triggered");
    alert("Save functionality coming soon!");
    setIsEditMode(false); // Exit edit mode after saving
  };

  const roundedDiscount = Math.round(totalDiscount);

  const canModifyOrder =
    order.SALES_ORDER_STATUS === "Pending" &&
    (userRole === "admin" || userRole === "superadmin");

  const handleAddProduct = () => {
    const newProduct = {
      SALES_ORDER_PROD_NAME: "",
      SALES_ORDER_LINE_QTY: 0,
      SALES_ORDER_LINE_PRICE: 0,
      SALES_ORDER_LINE_DISCOUNT: 0,
      SALES_ORDER_LINE_TOTAL: 0,
    };

    setOrderDetails([...orderDetails, newProduct]);
  };
  const handleProductSearch = async (query) => {
    try {
      // Replace this mock fetch with an API call to get product suggestions
      const response = await fetch("/api/products?search=" + query);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setSuggestions(data); // Update suggestions with API results
      } else {
        setSuggestions([]); // Reset if no results found
      }
    } catch (error) {
      console.error("Error fetching product suggestions:", error);
      setSuggestions([]); // Clear suggestions on error
    }
  };

  return (
    <Modal
      title="Customer Order Details"
      status={order.SALES_ORDER_STATUS}
      onClose={onClose}
    >
      <Section>
        <p>
          <strong>Order ID: </strong> {order.SALES_ORDER_ID}
        </p>
        <p>
          <strong>Order Created Date:</strong>{" "}
          {(() => {
            const date = new Date(order.SALES_ORDER_DATE_CREATED);
            if (!isNaN(date)) {
              const day = String(date.getDate()).padStart(2, "0");
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const year = date.getFullYear();
              return `${month}/${day}/${year}`;
            }
            return "Invalid Date";
          })()}
        </p>
        {/* Delivery Option */}
        <p>
          <strong>Delivery Option:</strong>
          <div>
            {isEditMode ? (
              <InputField
                type="text"
                value={order.SALES_ORDER_DLVRY_OPTION || ""}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetails,
                    SALES_ORDER_DLVRY_OPTION: e.target.value,
                  })
                }
              />
            ) : (
              order.SALES_ORDER_DLVRY_OPTION
            )}
          </div>
        </p>

        {/* Client Name */}
        <p>
          <strong>Client:</strong>
          <div>
            {isEditMode ? (
              <InputField
                type="text"
                value={order.SALES_ORDER_CLIENT_NAME || ""}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetails,
                    SALES_ORDER_CLIENT_NAME: e.target.value,
                  })
                }
              />
            ) : (
              order.SALES_ORDER_CLIENT_NAME
            )}
          </div>
        </p>

        {/* City */}
        <p>
          <strong>City:</strong>
          <div>
            {isEditMode ? (
              <InputField
                type="text"
                value={order.SALES_ORDER_CLIENT_CITY || ""}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetails,
                    SALES_ORDER_CLIENT_CITY: e.target.value,
                  })
                }
              />
            ) : (
              order.SALES_ORDER_CLIENT_CITY
            )}
          </div>
        </p>

        {/* Province */}
        <p>
          <strong>Province:</strong>
          <div>
            {isEditMode ? (
              <InputField
                type="text"
                value={order.SALES_ORDER_CLIENT_PROVINCE || ""}
                onChange={(e) =>
                  setOrderDetails({
                    ...orderDetails,
                    SALES_ORDER_CLIENT_PROVINCE: e.target.value,
                  })
                }
              />
            ) : (
              order.SALES_ORDER_CLIENT_PROVINCE
            )}
          </div>
        </p>
      </Section>

      <Section>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <TableHeader>Product Name</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader>Purchase Price</TableHeader>{" "}
                <TableHeader>Sell Price</TableHeader>{" "}
                <TableHeader>Discount</TableHeader>
                <TableHeader>Total</TableHeader>
              </tr>
            </thead>
            <tbody>
              {orderDetails.length > 0 ? (
                orderDetails.map((detail, index) => (
                  <TableRow key={index}>
                    {/* Product Name Cell */}
                    <TableCell>
                      {isEditMode ? (
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={detail.SALES_ORDER_PROD_NAME || ""}
                            placeholder="Search to add Product"
                            onChange={(e) => {
                              const value = e.target.value;
                              handleLineUpdate(
                                index,
                                "SALES_ORDER_PROD_NAME",
                                value
                              );
                              handleProductSearch(value); // Trigger search on input change
                            }}
                          />
                          {suggestions.length > 0 && (
                            <SuggestionsContainer>
                              {suggestions.map((product, i) => (
                                <SuggestionItem
                                  key={i}
                                  onClick={() => {
                                    handleLineUpdate(
                                      index,
                                      "SALES_ORDER_PROD_NAME",
                                      product
                                    );
                                    setSuggestions([]); // Clear suggestions on selection
                                  }}
                                >
                                  {product}
                                </SuggestionItem>
                              ))}
                            </SuggestionsContainer>
                          )}
                        </div>
                      ) : (
                        detail.SALES_ORDER_PROD_NAME || "Unknown Product"
                      )}
                    </TableCell>

                    {/* Quantity Cell */}
                    <TableCell>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={detail.SALES_ORDER_LINE_QTY || ""}
                          onChange={(e) =>
                            handleLineUpdate(
                              index,
                              "SALES_ORDER_LINE_QTY",
                              e.target.value.replace(/^0+/, "") // Remove leading zeros
                            )
                          }
                          style={{ textAlign: "center" }}
                        />
                      ) : (
                        detail.SALES_ORDER_LINE_QTY || 0
                      )}
                    </TableCell>

                    {/* Purchase Price Cell */}
                    <TableCell>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={detail.SALES_ORDER_LINE_PURCHASE_PRICE || "0"} // Default to 0 if empty (no .00)
                          onChange={(e) => {
                            let value = e.target.value;
                            // Remove leading zeros if the input is not empty
                            if (value) {
                              value = value.replace(/^0+/, "") || "0"; // Strip leading zeros and default to "0"
                            }
                            handleLineUpdate(
                              index,
                              "SALES_ORDER_LINE_PURCHASE_PRICE",
                              value
                            );
                          }}
                          style={{ textAlign: "center" }}
                        />
                      ) : (
                        formatCurrency(
                          detail.SALES_ORDER_LINE_PURCHASE_PRICE || 0
                        ) // Display formatted currency (default 0)
                      )}
                    </TableCell>
                    {/* Sales Price Cell */}
                    <TableCell>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={detail.SALES_ORDER_LINE_PRICE || ""} // Sales Price
                          onChange={(e) =>
                            handleLineUpdate(
                              index,
                              "SALES_ORDER_LINE_PRICE",
                              e.target.value.replace(/^0+/, "") // Remove leading zeros
                            )
                          }
                          style={{ textAlign: "center" }}
                        />
                      ) : (
                        formatCurrency(detail.SALES_ORDER_LINE_PRICE || 0)
                      )}
                    </TableCell>

                    {/* Discount Cell */}
                    <TableCell>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={detail.SALES_ORDER_LINE_DISCOUNT || "0"} // Default to 0 if empty
                          onChange={(e) => {
                            let value = e.target.value;
                            // Remove leading zeros if the input is not empty
                            if (value) {
                              value = value.replace(/^0+/, "") || "0"; // Strip leading zeros and default to "0"
                            }
                            handleLineUpdate(
                              index,
                              "SALES_ORDER_LINE_DISCOUNT",
                              value
                            );
                          }}
                          style={{ textAlign: "center" }}
                        />
                      ) : (
                        `${detail.SALES_ORDER_LINE_DISCOUNT || "0"}%` // Display discount percentage, default 0
                      )}
                    </TableCell>

                    {/* Total Price Cell */}
                    <TableCell>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={calculateLineTotal(detail)} // Total Price
                          readOnly
                          style={{ textAlign: "center" }}
                        />
                      ) : (
                        formatCurrency(detail.SALES_ORDER_LINE_TOTAL || 0) // Total Price
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No order details available.</TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
          {isEditMode && (
            <ButtonWrapper>
              <Button variant="primary" onClick={handleAddProduct}>
                Add Product
              </Button>
            </ButtonWrapper>
          )}
        </TableWrapper>

        <TotalSummary>
          <TotalItem>
            <strong>Total Quantity:</strong> {totalQuantity}
          </TotalItem>

          <TotalItem>
            <strong>Total Discount: </strong>
            <HighlightedDiscount>
              ₱
              {orderDetails
                .reduce((acc, detail) => {
                  // Calculate the discount based on the line's price, discount, and quantity
                  const discountValue =
                    (((parseFloat(detail.SALES_ORDER_LINE_PRICE) || 0) *
                      (parseFloat(detail.SALES_ORDER_LINE_DISCOUNT) || 0)) /
                      100) *
                    (parseInt(detail.SALES_ORDER_LINE_QTY, 10) || 0);
                  return acc + discountValue;
                }, 0)
                .toFixed(2)}
            </HighlightedDiscount>
          </TotalItem>

          <TotalItem>
            <strong>Total Revenue: </strong>
            <HighlightedTotal>
              ₱
              {orderDetails
                .reduce((acc, detail) => {
                  // Calculate Total Revenue for each line (Sell Price * Quantity)
                  const totalRevenue =
                    (parseFloat(detail.SALES_ORDER_LINE_PRICE) || 0) *
                    (parseInt(detail.SALES_ORDER_LINE_QTY, 10) || 0);
                  return acc + totalRevenue;
                }, 0)
                .toFixed(2)}
            </HighlightedTotal>
          </TotalItem>

          <TotalItem>
            <strong>Total Cost: </strong>
            <HighlightedTotal style={{ color: "#ff5757" }}>
              ₱
              {orderDetails
                .reduce((acc, detail) => {
                  // Calculate Total Cost as Purchase Price * Quantity
                  const totalCost =
                    (parseFloat(detail.SALES_ORDER_LINE_PURCHASE_PRICE) || 0) *
                    (parseInt(detail.SALES_ORDER_LINE_QTY, 10) || 0);
                  return acc + totalCost;
                }, 0)
                .toFixed(2)}
            </HighlightedTotal>
          </TotalItem>

          <TotalItem>
            <strong>Gross Profit: </strong>
            <HighlightedTotal style={{ color: "#1DBA0B" }}>
              ₱
              {(
                orderDetails.reduce((acc, detail) => {
                  // Calculate Total Revenue for each line (Sell Price * Quantity)
                  const totalRevenue =
                    (parseFloat(detail.SALES_ORDER_LINE_PRICE) || 0) *
                    (parseInt(detail.SALES_ORDER_LINE_QTY, 10) || 0);
                  return acc + totalRevenue;
                }, 0) -
                orderDetails.reduce((acc, detail) => {
                  // Calculate Total Cost as Purchase Price * Quantity
                  const totalCost =
                    (parseFloat(detail.SALES_ORDER_LINE_PURCHASE_PRICE) || 0) *
                    (parseInt(detail.SALES_ORDER_LINE_QTY, 10) || 0);
                  return acc + totalCost;
                }, 0)
              ).toFixed(2)}
            </HighlightedTotal>
          </TotalItem>
        </TotalSummary>
      </Section>

      {canModifyOrder && (
        <ButtonGroup>
          <Button variant="red" onClick={handleCancelOrder}>
            Cancel Order
          </Button>
          {isEditMode ? (
            <Button variant="green" onClick={handleSaveOrder}>
              Save Order
            </Button>
          ) : (
            <Button variant="green" onClick={handleUpdateOrder}>
              Update Order
            </Button>
          )}
          <Button variant="primary" onClick={handleAcceptOrder}>
            Accept Order
          </Button>
        </ButtonGroup>
      )}
    </Modal>
  );
};

// Styled Components
const SuggestionsContainer = styled.div`
  position: absolute;
  top: calc(100% + 4px); /* 4px gap between input and dropdown */
  left: 0;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ddd;
  background-color: #fff;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
`;

const SuggestionItem = styled.div`
  padding: 8px 10px;
  cursor: pointer;
  &:hover {
    background-color: ${colors.lightGrey};
  }
`;
const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  width: 100%;
`;

const InputField = styled.input`
  width: 100%;
  max-width: 300px;
  text-align: center;
  border: 1px solid #ddd;
  padding: 8px;
  margin-top: 5px;
  font-size: 14px;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #f9f9f9;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 12px;
  text-align: center;
  font-size: 16px;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  text-align: center;
  padding: 8px;
  font-size: 14px;
  border-bottom: 1px solid #ddd;

  input {
    width: 80%; /* Adjust the width to fit nicely in the cell */
    padding: 5px;
    font-size: 14px;
    border: 1px solid #ccc; /* Add border */
    border-radius: 4px; /* Optional: for rounded corners */
    box-sizing: border-box;
  }
`;

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
  color: green;
  font-size: 16px;
`;

const HighlightedDiscount = styled.span`
  color: red;
  font-size: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;

export default CustomerOrderDetailsModal;
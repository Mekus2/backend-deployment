import React, { useEffect, useState, useRef } from "react";
import Modal from "../../Layout/Modal";
// import INBOUND_DELIVERY from "../../../data/InboundData"; // Import the data
import { fetchOrderDetails } from "../../../api/SupplierDeliveryApi";
import { updateOrderStatus } from "../../../api/SupplierDeliveryApi";
import { jsPDF } from "jspdf";
import { logoBase64 } from "../../../data/imageData";
import { colors } from "../../../colors";
import Button from "../../Layout/Button";
// Import the styles
import {
  DetailsContainer,
  Column,
  FormGroup,
  Label,
  Value,
  ProgressSection,
  ProgressBar,
  ProgressFiller,
  ProgressText,
  ProductTable,
  TableHeader,
  TableRow,
  TableCell,
  TotalSummary,
  SummaryItem,
  HighlightedTotal,
  ModalFooter,
  StatusButton,
  InputContainer,
  Asterisk,
} from "./SupplierDeliveryStyles"; // Adjust the import path as needed
import { addNewInventoy } from "../../../api/InventoryApi";
import { notify } from "../../Layout/CustomToast";
import styled from "styled-components";

const SupplierDeliveryDetails = ({ delivery, onClose }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState(""); // Use state to track the status
  const [receivedDate, setReceivedDate] = useState("Not yet Received"); // Use state for received date
  const [expiryDates, setExpiryDates] = useState(
    Array((orderDetails || []).length).fill("") // Track expiry dates as an array
  );
  const [qtyAccepted, setQtyAccepted] = useState(
    Array((orderDetails || []).length).fill(0) // Track accepted quantities, initialized to 0
  );
  const [receivedClicked, setReceivedClicked] = useState(false); // Track if the Mark as Received button was clicked
  const today = new Date().toISOString().split("T")[0]; // Get today's date for validation
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false); // State for IssueDetails modal
  const [issueReported, setIssueReported] = useState(false); // Track if issue has been reported

  useEffect(() => {
    const fetchDetails = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (delivery.INBOUND_DEL_ID) {
        setLoading(true);
        setError(null);
        try {
          console.log(
            `Fetching details for Order ID: ${delivery.INBOUND_DEL_ID}`
          );
          const details = await fetchOrderDetails(
            delivery.INBOUND_DEL_ID,
            controller.signal
          );
          console.log("Received Details:", details);
          setOrderDetails(details);
          setStatus(delivery.INBOUND_DEL_STATUS);
        } catch (err) {
          if (err.name === "AbortError") {
            console.log("Fetch aborted"); // Request was canceled
          } else {
            console.error("Failed to fetch order details:", err); // Improved debug line for errors
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
  }, []);

  // Early return if order is not provided
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!orderDetails) return null;
  if (!delivery) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Return empty string if invalid date
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const handleIssueModalOpen = () => {
    setIssueReported(true); // Open the issue modal
    // You can add logic here to show the modal or update other state related to the issue
  };

  const handleIssueDetailsOpen = () => setIsIssueDetailsOpen(true); // Open IssueDetails modal
  
  const handleStatusChange = async (
    orderId,
    currentStatus,
    expiryDates = []
  ) => {
    let newStatus;
    let toastMessage = "";
    let toastType = "info"; // Default to info toast type

    // Define the cyclical transitions
    switch (currentStatus) {
      case "Pending":
        newStatus = "Dispatched";
        toastMessage = "Order has been dispatched.";
        toastType = "info"; // Informational toast
        break;
      case "Dispatched":
        newStatus = "Delivered";
        toastMessage = "Order has been delivered successfully.";
        toastType = "success"; // Success toast
        break;
      case "Delivered":
        newStatus = "Delivered with Issues"; // Change to Delivered with Issues
        toastMessage = "Order delivered with issues.";
        toastType = "warning"; // Warning toast
        break;
      case "Delivered with Issues":
        newStatus = "Pending"; // Revert back to "Pending"
        toastMessage = "Order status has been reset to 'Pending'.";
        toastType = "warning"; // Warning toast
        break;
      default:
        console.error("Invalid status:", currentStatus);
        toastMessage = "Invalid status, update failed.";
        toastType = "error"; // Error toast
        break;
    }

    // Validation for specific transitions
    if (currentStatus === "Dispatched" && newStatus === "Delivered") {
      const areAllExpiryDatesFilled = expiryDates.every((date) => date !== "");
      if (!areAllExpiryDatesFilled) {
        console.error("Please fill in all expiry dates.");
        toastMessage = "Please fill in all expiry dates before proceeding.";
        toastType = "warning"; // Warning toast for missing expiry dates
        notify[toastType](toastMessage); // Show the warning toast and exit
        return;
      }
    }

    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      if (updatedOrder) {
        console.log("Order updated successfully:", updatedOrder);
        setStatus(newStatus); // Update the status state

        // If the update was successful, show the relevant toast
        notify[toastType](toastMessage); // Display the appropriate toast type
      }
    } catch (error) {
      console.error("Error updating order status:", error);

      // Show an error toast if the update fails
      toastMessage = "Failed to update the order status. Please try again.";
      toastType = "error";
      notify[toastType](toastMessage);
    }
  };

  // Function to handle Qty Accepted input change
  const handleQtyAcceptedChange = (index, value) => {
    const qtyOrdered = orderDetails[index].INBOUND_DEL_DETAIL_ORDERED_QTY;
    const parsedValue = parseInt(value, 10);

    // If value is empty, reset to 0, otherwise set the new value
    const newQtyAccepted = [...qtyAccepted];
    if (value === "") {
      newQtyAccepted[index] = 0;
    } else if (
      isNaN(parsedValue) ||
      parsedValue < 0 ||
      parsedValue > qtyOrdered
    ) {
      newQtyAccepted[index] = 0;
    } else {
      newQtyAccepted[index] = parsedValue;
    }

    // Calculate the defect quantity and update both states at once
    const updatedOrderDetails = [...orderDetails];
    const defectQty = newQtyAccepted[index]
      ? qtyOrdered - newQtyAccepted[index]
      : 0;

    updatedOrderDetails[index] = {
      ...updatedOrderDetails[index],
      INBOUND_DEL_DETAIL_LINE_QTY: newQtyAccepted[index],
      INBOUND_DEL_DETAIL_LINE_QTY_DEFECT: defectQty,
    };

    // Set both states in one go
    setQtyAccepted(newQtyAccepted);
    setOrderDetails(updatedOrderDetails);
  };

  // Get progress percentage for each status
  const getProgressPercentage = () => {
    switch (status) {
      case "Pending":
        return 33; // 33% progress for Awaiting
      case "Dispatched":
        return 66; // 66% progress for In Transit
      case "Delivered":
        return 100; // 100% progress for Received
      default:
        return 0; // Default progress if status is unknown
    }
  };

  // Update expiry date for specific row
  const handleExpiryDateChange = (index, value) => {
    const newExpiryDates = [...expiryDates];
    newExpiryDates[index] = value; // Set the specific index with new date value
    setExpiryDates(newExpiryDates);

    // Update orderDetails only if the expiry date has changed
    const updatedOrderDetails = [...orderDetails];
    const currentExpiryDate =
      orderDetails[index].INBOUND_DEL_DETAIL_PROD_EXP_DATE;

    if (value !== currentExpiryDate) {
      updatedOrderDetails[index] = {
        ...updatedOrderDetails[index], // Keep other fields unchanged
        INBOUND_DEL_DETAIL_PROD_EXP_DATE: value, // Update the expiry date
      };

      setOrderDetails(updatedOrderDetails); // Update orderDetails state
    }
  };

  // Calculate total value for each product (Quantity Delivered * Price per Unit)
  const calculateItemTotal = (qtyAccepted, price) => qtyAccepted * price;

  // Calculate total quantity and total amount for the summary
  const totalQuantity = orderDetails.reduce(
    (total, item) => total + item.INBOUND_DEL_DETAIL_ORDERED_QTY,
    0
  );
  const totalAmount = orderDetails.reduce(
    (total, item, index) =>
      total +
      calculateItemTotal(
        qtyAccepted[index], // Use qtyAccepted instead of qtyOrdered
        item.INBOUND_DEL_DETAIL_LINE_PRICE
      ),
    0
  );
  const generateInvoice = () => {
    const doc = new jsPDF();

    // Use UTF-8 encoding to ensure characters like peso sign render correctly
    doc.setFont("helvetica", "normal", "utf-8");

    // Add the company logo at the upper left corner with aspect ratio locked
    const logoWidth = 12; // Width for the logo
    const logoHeight = logoWidth; // Height set to maintain 1:1 aspect ratio
    const logoX = 12; // Margin Left
    const logoY = 5; // Margin Top
    doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight); // Adds the logo at upper left

    // Center the company name closer to the top
    const pageWidth = doc.internal.pageSize.width;

    // Set plain styling for the company name and center it
    doc.setFontSize(16); // Slightly smaller font size for better alignment
    doc.setFont("helvetica", "bold");
    doc.text("PHILVETS", pageWidth / 2, logoY + logoHeight + 8, {
      align: "center",
    });

    // Company number (move closer to the company name)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123-456-789", pageWidth / 2, logoY + logoHeight + 14, {
      align: "center",
    });

    // Title of the invoice (bold and larger, left-aligned)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", 20, 30); // Move to the left

    // Customer and delivery details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${delivery.CUSTOMER_NAME}`, 20, 40);
    doc.text(`City: ${delivery.OUTBOUND_DEL_CITY}`, 20, 45);
    doc.text(`Province: ${delivery.OUTBOUND_DEL_PROVINCE}`, 20, 50);
    doc.text(`Delivery Status: ${status}`, 20, 55);
    doc.text(`Shipped Date: ${delivery.OUTBOUND_DEL_SHIPPED_DATE}`, 20, 60);
    doc.text(`Received Date: ${receivedDate}`, 20, 65);

    // Table for order details
    doc.autoTable({
      startY: 70,
      head: [["Product Name", "Quantity Shipped", "Price", "Total"]],
      body: orderDetails.map((item) => [
        item.OUTBOUND_DETAILS_PROD_NAME,
        item.OUTBOUND_DETAILS_PROD_QTY,
        Number(item.OUTBOUND_DETAILS_LINE_PRICE).toFixed(2), // Removed the peso sign
        calculateItemTotal(
          item.OUTBOUND_DETAILS_PROD_QTY,
          item.OUTBOUND_DETAILS_LINE_PRICE
        ).toFixed(2), // Removed the peso sign
      ]),
      styles: {
        cellPadding: 3,
        fontSize: 10,
        halign: "center", // Center all data in the cells
        valign: "middle",
        lineWidth: 0.5, // Line width for cell borders
        lineColor: [169, 169, 169], // Gray color for the lines
      },
      headStyles: {
        fillColor: [0, 196, 255],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center", // Center header text
        lineWidth: 0.5, // Line width for header cell borders
        lineColor: [169, 169, 169], // Gray color for the lines
      },
    });

    // Total summary
    const total = totalAmount.toFixed(2);
    doc.text(
      `Total Quantity: ${totalQuantity}`,
      20,
      doc.autoTable.previous.finalY + 10
    );
    doc.text(`Total Amount: ${total}`, 20, doc.autoTable.previous.finalY + 15); // Removed peso sign here as well

    // Save the PDF
    doc.save("Invoice.pdf");
  };
  // Handle the Mark as Received button click
  const handleMarkAsReceivedClick = async () => {
    setReceivedClicked(true); // Custom behavior (if needed)

    // Check if all expiry dates are filled
    if (!expiryDates.every((date) => date !== "")) {
      console.error("Please fill in all expiry dates.");
      return;
    }
    console.info("Order Details Data:", orderDetails);

    // Prepare inventory data to be posted
    // const inventoryData = orderDetails.map((item, index) => {
    //   const expiryDate = expiryDates[index];
    //   return {
    //     PRODUCT_ID: item.INBOUND_DEL_DETAIL_PROD_ID, // Assuming `PRODUCT_ID` is part of `orderDetails`
    //     INBOUND_DEL_ID: delivery.INBOUND_DEL_ID,
    //     EXPIRY_DATE: expiryDate,
    //     QUANTITY: item.QUANTITY, // Assuming `QUANTITY` is part of `orderDetails`
    //   };
    // });

    // console.log("Inventory data prepared for posting:", inventoryData);

    // Try posting the inventory data and updating the status
    // // try {
    // //   // Iterate over inventoryData and post each entry
    // //   for (const inventoryItem of inventoryData) {
    // //     const response = await addNewInventoy(inventoryItem); // Posting inventory item
    // //     if (response) {
    // //       console.log("Inventory entry created successfully:", response);
    // //     } else {
    // //       console.error("Failed to create inventory entry for:", inventoryItem);
    // //     }
    // //   }

    // //   // After all inventory data is posted, update the status
    // //   console.log("All inventory data posted successfully, updating status...");
    // //   handleStatusChange(delivery.INBOUND_DEL_ID, status, expiryDates);
    // } catch (error) {
    //   console.error("Error posting to Inventory:", error);
    // }
  };
  // Calculate Qty Defect (Difference between Delivered Quantity and Accepted Quantity)
  const calculateQtyDefect = (index) => {
    const qtyDelivered = orderDetails[index].INBOUND_DEL_DETAIL_ORDERED_QTY;
    const qtyAcceptedForItem = qtyAccepted[index];

    // Calculate the defect quantity
    const defectQty = qtyAcceptedForItem
      ? qtyDelivered - qtyAcceptedForItem
      : 0;

    // Check if the defect quantity has actually changed before updating state
    if (defectQty !== orderDetails[index].INBOUND_DEL_DETAIL_LINE_QTY_DEFECT) {
      // Only update the orderDetails state if the defect quantity has changed
      const updatedOrderDetails = [...orderDetails];
      updatedOrderDetails[index] = {
        ...updatedOrderDetails[index], // Keep other fields unchanged
        INBOUND_DEL_DETAIL_LINE_QTY_DEFECT: defectQty, // Set defect quantity
      };

      setOrderDetails(updatedOrderDetails); // Update the state
    }

    return defectQty;
  };

  return (
    <Modal
      data-cy="inbound-delivery-details-modal"
      title="Inbound Delivery Details"
      status={status}
      onClose={onClose}
    >
      <DetailsContainer>
        <Column>
          <FormGroup>
            <Label>Delivery ID:</Label>
            <Value>{delivery.INBOUND_DEL_ID}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Supplier Name:</Label>
            <Value>{delivery.INBOUND_DEL_SUPP_NAME}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received Date:</Label>
            <Value>{receivedDate}</Value>
          </FormGroup>
        </Column>
        <Column>
          <FormGroup>
            <Label>Date Created:</Label>
            <Value>{formatDate(delivery.INBOUND_DEL_ORDER_DATE_CREATED)}</Value>
          </FormGroup>
          <FormGroup>
            <Label>Received By:</Label>
            <Value>{delivery.OUTBOUND_DEL_ACCPTD_BY_USER || ""}</Value>
          </FormGroup>
        </Column>
      </DetailsContainer>
      {/* Product Table */}
      {/* Product Table */}
      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Qty</TableHeader>
            <TableHeader>Purchase Price</TableHeader>
            <TableHeader>Sell Price</TableHeader>
            <TableHeader>Discount</TableHeader>
            <TableHeader>Total</TableHeader>
          </tr>
        </thead>
        <tbody>
          {orderDetails.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.INBOUND_DETAILS_PROD_NAME}</TableCell>{" "}
              {/* Product Name */}
              <TableCell>{item.INBOUND_DETAILS_PROD_QTY}</TableCell>{" "}
              {/* Quantity */}
              {/* Purchase Price */}
              <TableCell>
                ₱{(Number(item.INBOUND_DETAILS_PURCHASE_PRICE) || 0).toFixed(2)}{" "}
                {/* Purchase price */}
              </TableCell>
              {/* Sell Price */}
              <TableCell>
                ₱{(Number(item.INBOUND_DETAILS_SELL_PRICE) || 0).toFixed(2)}{" "}
                {/* Sell price */}
              </TableCell>
              {/* Discount */}
              <TableCell>
                {item.INBOUND_DETAILS_DISCOUNT
                  ? `${item.INBOUND_DETAILS_DISCOUNT}%`
                  : "No Discount"}
              </TableCell>
              {/* Total (Qty x Sell Price x (1 - Discount)) */}
              <TableCell>
                ₱
                {(
                  (Number(item.INBOUND_DETAILS_PROD_QTY) || 0) *
                  (Number(item.INBOUND_DETAILS_SELL_PRICE) || 0) *
                  (1 - (Number(item.INBOUND_DETAILS_DISCOUNT) || 0) / 100)
                ).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </ProductTable>
      <TotalSummary>
        {/* Total Quantity Ordered */}
        <SummaryItem>
          <strong>Total Quantity Ordered:</strong>{" "}
          {orderDetails.reduce(
            (acc, detail) =>
              acc + (parseInt(detail.INBOUND_DETAILS_PROD_QTY, 10) || 0),
            0
          )}
        </SummaryItem>

        {/* Total Discount */}
        <SummaryItem>
          <strong>Total Discount:</strong>{" "}
          <HighlightedTotal>
            ₱
            {orderDetails
              .reduce((acc, detail) => {
                const discountValue =
                  (((parseFloat(detail.INBOUND_DETAILS_SELL_PRICE) || 0) *
                    (parseFloat(detail.INBOUND_DETAILS_DISCOUNT) || 0)) /
                    100) *
                  (parseInt(detail.INBOUND_DETAILS_PROD_QTY, 10) || 0);
                return acc + discountValue;
              }, 0)
              .toFixed(2)}
          </HighlightedTotal>
        </SummaryItem>

        {/* Total Revenue (Selling Price * Quantity) */}
        <SummaryItem>
          <strong>Total Revenue:</strong>{" "}
          <HighlightedTotal style={{ color: "#f08400" }}>
            ₱
            {orderDetails
              .reduce((acc, detail) => {
                const totalRevenue =
                  (parseFloat(detail.INBOUND_DETAILS_SELL_PRICE) || 0) *
                  (parseInt(detail.INBOUND_DETAILS_PROD_QTY, 10) || 0);
                return acc + totalRevenue;
              }, 0)
              .toFixed(2)}
          </HighlightedTotal>
        </SummaryItem>

        {/* Total Cost (Purchase Price * Quantity) */}
        <SummaryItem>
          <strong>Total Cost:</strong>{" "}
          <HighlightedTotal style={{ color: "#ff5757" }}>
            ₱
            {orderDetails
              .reduce((acc, detail) => {
                const totalCost =
                  (parseFloat(detail.INBOUND_DETAILS_PURCHASE_PRICE) || 0) *
                  (parseInt(detail.INBOUND_DETAILS_PROD_QTY, 10) || 0);
                return acc + totalCost;
              }, 0)
              .toFixed(2)}
          </HighlightedTotal>
        </SummaryItem>

        {/* Gross Profit (Revenue - Cost) */}
        <SummaryItem>
          <strong>Gross Profit:</strong>{" "}
          <HighlightedTotal style={{ color: "#1DBA0B" }}>
            ₱
            {(
              orderDetails.reduce((acc, detail) => {
                const totalRevenue =
                  (parseFloat(detail.INBOUND_DETAILS_SELL_PRICE) || 0) *
                  (parseInt(detail.INBOUND_DETAILS_PROD_QTY, 10) || 0);
                return acc + totalRevenue;
              }, 0) -
              orderDetails.reduce((acc, detail) => {
                const totalCost =
                  (parseFloat(detail.INBOUND_DETAILS_PURCHASE_PRICE) || 0) *
                  (parseInt(detail.INBOUND_DETAILS_PROD_QTY, 10) || 0);
                return acc + totalCost;
              }, 0)
            ).toFixed(2)}
          </HighlightedTotal>
        </SummaryItem>
      </TotalSummary>
      {/* Progress Bar */}
      {/* Progress Bar */}
      <ProgressSection>
        <ProgressBar>
          <ProgressFiller progress={getProgressPercentage()} />
        </ProgressBar>
        <ProgressText>{getProgressPercentage()}%</ProgressText>
      </ProgressSection>
      {/* Status Change Buttons */}
      <ModalFooter>
  {status === "Delivered with Issues" && !issueReported && (
    <IssueButton onClick={handleIssueModalOpen} style={{ marginRight: 'auto' }}>
      What's the issue?
    </IssueButton>
  )}
  {status === "Delivered with Issues" && issueReported && (
    <IssueButton onClick={handleIssueDetailsOpen} style={{ marginRight: 'auto' }}>
      Issue details
    </IssueButton>
  )}
  {status === "Delivered" && (
    <InvoiceButton onClick={generateInvoice}>Invoice</InvoiceButton>
  )}
  <StatusButton onClick={handleStatusChange}>
    {status === "Pending"
      ? "Mark as In Transit"
      : status === "In Transit"
      ? "Mark as Delivered"
      : status === "Delivered"
      ? "Mark as Delivered with Issues"
      : "Mark as Delivered"}
  </StatusButton>
</ModalFooter>

      ;
    </Modal>
  );
};

const InvoiceButton = styled.button`
  background-color: ${colors.primary}; /* Green color */
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-right: 10px;

  &:hover {
    background-color: ${colors.primaryHover};
  }
`;
const IssueButton = styled.button`
  color: Gray;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-right: 10px;

  &:hover {
    color: black;
  }
`;

export default SupplierDeliveryDetails;

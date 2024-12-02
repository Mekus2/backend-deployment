import React, { useEffect, useState, useRef } from "react";
import Modal from "../../Layout/Modal";
import Loading from "../../Layout/Loading";
import {
  fetchCustomerDelDetails,
  updateDeliveryStatus,
  createSalesInvoice,
} from "../../../api/CustomerDeliveryApi";
import CustomerCreateIssueModal from "./CustomerCreateIssueModal"; // Import the Issue Modal
import { notify } from "../../Layout/CustomToast";
import { jsPDF } from "jspdf";
import { logoBase64 } from "../../../data/imageData";
import {
  InvoiceButton,
  ErrorContainer,
  DetailsContainer,
  Column,
  FormGroup,
  Label,
  Value,
  ProductTable,
  TableHeader,
  TableRow,
  TableCell,
  TotalSummary,
  SummaryItem,
  HighlightedTotal,
  ProgressSection,
  ProgressBar,
  ProgressFiller,
  ProgressText,
  ModalFooter,
  StatusButton,
  IssueButton,
} from "../DeliveryStyles"; // Ensure correct path

const getProgressForStatus = (status) => {
  switch (status) {
    case "Pending":
      return 0;
    case "Dispatched":
      return 50;
    case "Delivered":
      return 100;
    case "Delivered with Issues":
      return 75;
    default:
      return 0;
  }
};

const CustomerDeliveryDetails = ({ delivery, onClose }) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [status, setStatus] = useState("");
  const [receivedDate, setReceivedDate] = useState(
    delivery.OUTBOUND_DEL_DATE_CUST_RCVD || "Not Received"
  );
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false); // State for IssueDetails modal
  const [issueReported, setIssueReported] = useState(false); // Track if issue has been reported

  const progress = getProgressForStatus(status);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!delivery.OUTBOUND_DEL_ID) {
        console.warn("Delivery ID is not available yet");
        return;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const details = await fetchCustomerDelDetails(
          delivery.OUTBOUND_DEL_ID,
          controller.signal
        );
        console.log("Fetched Details:", details);
        setOrderDetails(details);
        setStatus(delivery.OUTBOUND_DEL_STATUS);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Failed to fetch order details:", error);
          setError("Failed to fetch order details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [delivery]);

  const calculateTotalQuantity = () =>
    orderDetails.reduce(
      (total, item) => total + item.OUTBOUND_DETAILS_PROD_QTY,
      0
    );
  const calculateItemTotal = (qty, price) => qty * price;
  const totalQuantity = calculateTotalQuantity();
  const totalAmount = orderDetails.reduce(
    (total, item) =>
      total +
      calculateItemTotal(
        item.OUTBOUND_DETAILS_PROD_QTY,
        item.OUTBOUND_DETAILS_SELL_PRICE
      ),
    0
  );

  const handleStatusChange = async () => {
    let newStatus;
    let updatedReceivedDate = receivedDate; // Store the updated received date (if applicable)

    // Determine the new status based on the current one
    if (status === "Pending") {
      newStatus = "Dispatched";
      notify.info("Delivery status updated to Dispatched.");
    } else if (status === "Dispatched") {
      newStatus = "Delivered"; // Update the status to Delivered
      // Call the createSalesInvoice function and store its response status in a new variable
      const outboundDeliveryId = delivery.OUTBOUND_DEL_ID;
      const invoiceStatus = await createSalesInvoice(outboundDeliveryId);

      // Check the status returned from the API call
      if (invoiceStatus === 200) {
        // Only update status if invoice creation was successful
        notify.success(
          "Sales Invoice created successfully, Delivery marked as Delivered."
        );
        updatedReceivedDate = new Date().toISOString().split("T")[0]; // Set received date when marking as Delivered
        setReceivedDate(updatedReceivedDate); // Update the local received date
      } else {
        notify.error(
          "Failed to create Sales Invoice. Delivery status remains as Dispatched."
        );
        return; // Don't proceed if invoice creation failed
      }
    } else if (status === "Delivered") {
      newStatus = "Delivered"; // Status is already delivered, so just notify
      notify.success("Delivery marked as Delivered.");
    } else if (status === "Delivered with Issues") {
      newStatus = "Pending";
      setReceivedDate("Not Received");
      notify.error("Delivery status reset to Pending.");
    }

    // Update the local status
    setStatus(newStatus);

    // Prepare the status update data
    const statusData = {
      status: newStatus,
      receivedDate: updatedReceivedDate, // Send the updated received date if applicable
    };

    // Sync the status with the backend only if the status is "Pending"
    if (newStatus === "Dispatched") {
      try {
        const response = await updateDeliveryStatus(
          delivery.OUTBOUND_DEL_ID,
          statusData
        );

        // Check if the status was successfully updated
        if (response) {
          console.log(`Delivery status successfully updated to ${newStatus}`);
        } else {
          notify.error("Failed to update delivery status on the backend.");
        }
      } catch (error) {
        console.error("Error updating delivery status on the backend:", error);
        notify.error("Failed to update delivery status.");
      }
    }
  };

  const handleIssueModalOpen = () => setIsIssueModalOpen(true); // This remains for opening the initial "What's the issue?" modal
  const handleIssueModalClose = () => setIsIssueModalOpen(false); // This closes the initial modal

  const handleIssueDetailsOpen = () => setIsIssueDetailsOpen(true); // Open IssueDetails modal
  const handleIssueDetailsClose = () => setIsIssueDetailsOpen(false); // Close IssueDetails modal

  const handleIssueModalSubmit = (updatedOrderDetails, remarks) => {
    console.log("Issue reported:", updatedOrderDetails, remarks);
    setIssueReported(true); // Mark issue as reported after submission
    setIsIssueModalOpen(false); // Close the modal
  };

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
        item.OUTBOUND_DETAILS_PROD_QTY_ORDERED,
        Number(item.OUTBOUND_DETAILS_SELL_PRICE).toFixed(2), // Removed the peso sign
        calculateItemTotal(
          item.OUTBOUND_DETAILS_PROD_QTY_ORDERED,
          item.OUTBOUND_DETAILS_SELL_PRICE
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

  return (
    <>
      <Modal
        data-cy="outbound-delivery-details-modal"
        title="Outbound Delivery Details"
        status={status}
        onClose={onClose}
      >
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorContainer>{error}</ErrorContainer>
        ) : (
          <>
            <DetailsContainer>
              <Column>
                <FormGroup>
                  <Label>Delivery ID:</Label>
                  <Value>{delivery.OUTBOUND_DEL_ID}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Shipped Date:</Label>
                  <Value>
                    {delivery.OUTBOUND_DEL_SHIPPED_DATE || "Not yet Shipped"}
                  </Value>
                </FormGroup>
                <FormGroup>
                  <Label>Received Date:</Label>
                  <Value>{receivedDate}</Value>
                </FormGroup>
              </Column>
              <Column>
                <FormGroup>
                  <Label>Delivery Option:</Label>
                  <Value>{delivery.OUTBOUND_DEL_DLVRY_OPTION}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>City:</Label>
                  <Value>{delivery.OUTBOUND_DEL_CITY}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Province:</Label>
                  <Value>{delivery.OUTBOUND_DEL_PROVINCE}</Value>
                </FormGroup>
              </Column>
            </DetailsContainer>
            <ProductTable>
              <thead>
                <tr>
                  <TableHeader>Product Name</TableHeader>
                  <TableHeader>Qty Ordered</TableHeader>
                  <TableHeader>Qty Accepted</TableHeader>
                  <TableHeader>Qty Defect</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Total</TableHeader>
                </tr>
              </thead>
              <tbody>
                {orderDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.OUTBOUND_DETAILS_PROD_NAME}</TableCell>
                    <TableCell>
                      {item.OUTBOUND_DETAILS_PROD_QTY_ORDERED}
                    </TableCell>
                    <TableCell>
                      {status === "Dispatched" ? (
                        <input
                          type="text"
                          value={item.QTY_ACCEPTED || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numericValue =
                              value === "" ? "" : value.replace(/[^0-9]/g, ""); // Allow empty string for direct "0" input

                            let newQtyAccepted =
                              numericValue === ""
                                ? ""
                                : parseInt(numericValue, 10);
                            // Ensure the new quantity is within the valid range (not greater than Qty Ordered)
                            if (
                              newQtyAccepted !== "" &&
                              newQtyAccepted >
                                item.OUTBOUND_DETAILS_PROD_QTY_ORDERED
                            )
                              newQtyAccepted =
                                item.OUTBOUND_DETAILS_PROD_QTY_ORDERED;

                            const newQtyDefect =
                              newQtyAccepted === "" || newQtyAccepted === 0
                                ? 0
                                : item.OUTBOUND_DETAILS_PROD_QTY_ORDERED -
                                  newQtyAccepted;

                            setOrderDetails((prevDetails) =>
                              prevDetails.map((detail, detailIndex) =>
                                detailIndex === index
                                  ? {
                                      ...detail,
                                      QTY_ACCEPTED: newQtyAccepted,
                                      QTY_DEFECT: newQtyDefect, // Update Qty Defect based on Qty Accepted
                                    }
                                  : detail
                              )
                            );
                          }}
                          style={{
                            border: "1px solid #ccc",
                            padding: "5px",
                            borderRadius: "4px",
                            textAlign: "center",
                          }}
                        />
                      ) : (
                        item.QTY_ACCEPTED || 0
                      )}
                    </TableCell>

                    <TableCell>{item.QTY_DEFECT || 0}</TableCell>

                    <TableCell>
                      ₱
                      {(isNaN(Number(item.OUTBOUND_DETAILS_SELL_PRICE))
                        ? 0
                        : Number(item.OUTBOUND_DETAILS_SELL_PRICE)
                      ).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      ₱
                      {(
                        calculateItemTotal(
                          item.QTY_ACCEPTED || item.OUTBOUND_DETAILS_PROD_QTY,
                          item.OUTBOUND_DETAILS_SELL_PRICE
                        ) *
                        (1 - (item.OUTBOUND_DETAILS_DISCOUNT || 0) / 100)
                      ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ProductTable>

            <TotalSummary>
              {/* Total Quantity */}
              <SummaryItem>
                <strong>Total Quantity:</strong>{" "}
                {orderDetails.reduce(
                  (acc, detail) =>
                    acc +
                    (parseInt(detail.OUTBOUND_DETAILS_PROD_LINE_QTY, 10) || 0),
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
                        (((parseFloat(
                          detail.OUTBOUND_DETAILS_PROD_SELL_PRICE
                        ) || 0) *
                          (parseFloat(detail.OUTBOUND_DETAILS_PROD_DISCOUNT) ||
                            0)) /
                          100) *
                        (parseInt(detail.OUTBOUND_DETAILS_PROD_LINE_QTY, 10) ||
                          0);
                      return acc + discountValue;
                    }, 0)
                    .toFixed(2)}
                </HighlightedTotal>
              </SummaryItem>

              {/* Total Cost */}
              <SummaryItem>
                <strong>Total Cost:</strong>{" "}
                <HighlightedTotal style={{ color: "#ff5757" }}>
                  ₱
                  {orderDetails
                    .reduce((acc, detail) => {
                      const totalCost =
                        (parseFloat(detail.OUTBOUND_DETAILS_PROD_SALES_PRICE) ||
                          0) *
                        (parseInt(detail.OUTBOUND_DETAILS_PROD_LINE_QTY, 10) ||
                          0);
                      return acc + totalCost;
                    }, 0)
                    .toFixed(2)}
                </HighlightedTotal>
              </SummaryItem>
            </TotalSummary>

            <ProgressSection>
              <ProgressBar>
                <ProgressFiller progress={progress} />
              </ProgressBar>
              <ProgressText>{progress}%</ProgressText>
            </ProgressSection>

            <ModalFooter>
              {status === "Pending" && (
                <StatusButton onClick={() => handleStatusChange("Dispatched")}>
                  Mark as Dispatched
                </StatusButton>
              )}
              {status === "Dispatched" && (
                <>
                  <IssueButton onClick={handleIssueModalOpen}>
                    What's the issue?
                  </IssueButton>
                  <StatusButton onClick={() => handleStatusChange("Delivered")}>
                    Mark as Delivered
                  </StatusButton>
                </>
              )}
              {status === "Delivered" && (
                <>
                  <InvoiceButton onClick={generateInvoice}>
                    Generate Invoice
                  </InvoiceButton>
                  {/* No "Delivered with Issues" button here */}
                </>
              )}
            </ModalFooter>
          </>
        )}
      </Modal>

      {isIssueModalOpen && (
        <CustomerCreateIssueModal
          orderDetails={orderDetails}
          onClose={handleIssueModalClose}
          onSubmit={handleIssueModalSubmit}
        />
      )}

      {isIssueDetailsOpen}
    </>
  );
};

export default CustomerDeliveryDetails;

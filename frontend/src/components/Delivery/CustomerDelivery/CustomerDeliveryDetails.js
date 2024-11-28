import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import Loading from "../../Layout/Loading"; // Import the Loading component
import { colors } from "../../../colors";
import { fetchCustomerDelDetails } from "../../../api/CustomerDeliveryApi";
import CustomerCreateIssueModal from "./CustomerCreateIssueModal"; // Import the Issue Modal
import { notify } from "../../Layout/CustomToast";
import { jsPDF } from "jspdf";
import { logoBase64 } from "../../../data/imageData";
const getProgressForStatus = (status) => {
  switch (status) {
    case "Pending":
      return 0;
    case "In Transit":
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

  const handleStatusChange = () => {
    let newStatus;
    if (status === "Pending") {
      newStatus = "In Transit";
      notify.info("Delivery status updated to In Transit.");
    } else if (status === "In Transit") {
      newStatus = "Delivered";
      const currentDate = new Date().toISOString().split("T")[0];
      setReceivedDate(currentDate);
      delivery.OUTBOUND_DEL_DATE_CUST_RCVD = currentDate;
      notify.success("Delivery marked as Delivered.");
    } else if (status === "Delivered") {
      newStatus = "Delivered with Issues";
      notify.warning("Delivery marked as Delivered with Issues.");
    } else if (status === "Delivered with Issues") {
      newStatus = "Pending";
      setReceivedDate("Not Received");
      notify.error("Delivery status reset to Pending.");
    }

    setStatus(newStatus);
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
        item.OUTBOUND_DETAILS_PROD_QTY,
        Number(item.OUTBOUND_DETAILS_SELL_PRICE).toFixed(2), // Removed the peso sign
        calculateItemTotal(
          item.OUTBOUND_DETAILS_PROD_QTY,
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
                  <Value>{delivery.OUTBOUND_DEL_SHIPPED_DATE}</Value>
                </FormGroup>
                <FormGroup>
                  <Label>Received Date:</Label>
                  <Value>{receivedDate}</Value>
                </FormGroup>
              </Column>
              <Column>
                <FormGroup>
                  <Label>Delivery Option:</Label>
                  <Value>{delivery.OUTBOUND_DEL_DLVRY_OPT}</Value>
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
                  <TableHeader>Qty</TableHeader>
                  <TableHeader>Purchase Price</TableHeader>{" "}
                  {/* New Column for Purchase Price */}
                  <TableHeader>Sell Price</TableHeader>{" "}
                  {/* New Column for Sell Price */}
                  <TableHeader>Discount</TableHeader>{" "}
                  {/* New Column for Discount */}
                  <TableHeader>Total</TableHeader>
                </tr>
              </thead>
              <tbody>
                {orderDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.OUTBOUND_DETAILS_PROD_NAME}</TableCell>
                    <TableCell>{item.OUTBOUND_DETAILS_PROD_QTY}</TableCell>

                    {/* Purchase Price (Assumed to be a different field, use the correct field for Purchase Price) */}
                    <TableCell>
                      ₱
                      {(
                        Number(item.OUTBOUND_DETAILS_PURCHASE_PRICE) || 0
                      ).toFixed(2)}{" "}
                      {/* Update with correct purchase price field */}
                    </TableCell>

                    {/* Sell Price */}
                    <TableCell>
                      ₱
                      {(Number(item.OUTBOUND_DETAILS_SELL_PRICE) || 0).toFixed(
                        2
                      )}{" "}
                      {/* Renamed to SELL_PRICE */}
                    </TableCell>

                    {/* Discount (Assumed to be a percentage value) */}
                    <TableCell>
                      {item.OUTBOUND_DETAILS_DISCOUNT
                        ? `${item.OUTBOUND_DETAILS_DISCOUNT}%`
                        : "No Discount"}
                    </TableCell>

                    {/* Total (Calculation considering Qty, Sell Price, and Discount) */}
                    <TableCell>
                      ₱
                      {(
                        calculateItemTotal(
                          item.OUTBOUND_DETAILS_PROD_QTY,
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

              {/* Total Revenue */}
              <SummaryItem>
                <strong>Total Revenue:</strong>{" "}
                <HighlightedTotal style={{ color: "#f08400" }}>
                  ₱
                  {orderDetails
                    .reduce((acc, detail) => {
                      const totalRevenue =
                        (parseFloat(detail.OUTBOUND_DETAILS_PROD_SELL_PRICE) ||
                          0) *
                        (parseInt(detail.OUTBOUND_DETAILS_PROD_LINE_QTY, 10) ||
                          0);
                      return acc + totalRevenue;
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

              {/* Gross Profit */}
              <SummaryItem>
                <strong>Gross Profit:</strong>{" "}
                <HighlightedTotal style={{ color: "#1DBA0B" }}>
                  ₱
                  {(
                    orderDetails.reduce((acc, detail) => {
                      const totalRevenue =
                        (parseFloat(detail.OUTBOUND_DETAILS_PROD_SELL_PRICE) ||
                          0) *
                        (parseInt(detail.OUTBOUND_DETAILS_PROD_LINE_QTY, 10) ||
                          0);
                      return acc + totalRevenue;
                    }, 0) -
                    orderDetails.reduce((acc, detail) => {
                      const totalCost =
                        (parseFloat(detail.OUTBOUND_DETAILS_PROD_SELL_PRICE) ||
                          0) *
                        (parseInt(detail.OUTBOUND_DETAILS_PROD_LINE_QTY, 10) ||
                          0);
                      return acc + totalCost;
                    }, 0)
                  ).toFixed(2)}
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
                <StatusButton onClick={handleStatusChange}>
                  Mark as In Transit
                </StatusButton>
              )}
              {status === "In Transit" && (
                <>
                  <IssueButton onClick={handleIssueModalOpen}>
                    What's the issue?
                  </IssueButton>
                  <StatusButton onClick={handleStatusChange}>
                    Mark as Delivered
                  </StatusButton>
                </>
              )}
              {status === "Delivered" && (
                <InvoiceButton onClick={generateInvoice}>Invoice</InvoiceButton>
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

// Styled components
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

const ErrorContainer = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: ${colors.error};
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Column = styled.div`
  width: 48%;
`;

const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const Label = styled.div`
  font-weight: bold;
  color: black;
`;

const Value = styled.div`
  color: ${colors.text};
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-top: 15px;
  margin-bottom: 20px;
`;

const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
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

const HighlightedTotal = styled.span`
  color: green;
  font-size: 16px;
`;

const ProgressSection = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin: 10px 0;
`;

const ProgressFiller = styled.div`
  height: 100%;
  width: ${(props) => props.progress}%;
  background-color: ${colors.primary};
  border-radius: 10px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  color: ${colors.primary};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const StatusButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-left: 10px;

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

export default CustomerDeliveryDetails;

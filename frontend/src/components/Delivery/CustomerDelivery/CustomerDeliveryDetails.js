import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal";
import Loading from "../../Layout/Loading"; // Import the Loading component
import { colors } from "../../../colors";
import { fetchCustomerDelDetails } from "../../../api/CustomerDeliveryApi";
import CustomerIssueModal from "./CustomerIssueModal"; // Import the Issue Modal
import IssueDetails from "./IssueDetails";
import { notify } from "../../Layout/CustomToast";

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
  const [receivedDate, setReceivedDate] = useState(delivery.OUTBOUND_DEL_DATE_CUST_RCVD || "Not Received");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false);  // State for IssueDetails modal
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
        const details = await fetchCustomerDelDetails(delivery.OUTBOUND_DEL_ID, controller.signal);
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

  const calculateTotalQuantity = () => orderDetails.reduce((total, item) => total + item.OUTBOUND_DETAILS_PROD_QTY, 0);
  const calculateItemTotal = (qty, price) => qty * price;
  const totalQuantity = calculateTotalQuantity();
  const totalAmount = orderDetails.reduce((total, item) => total + calculateItemTotal(item.OUTBOUND_DETAILS_PROD_QTY, item.OUTBOUND_DETAILS_LINE_PRICE), 0);

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

  const handleIssueModalOpen = () => setIsIssueModalOpen(true);  // This remains for opening the initial "What's the issue?" modal
  const handleIssueModalClose = () => setIsIssueModalOpen(false);  // This closes the initial modal

  const handleIssueDetailsOpen = () => setIsIssueDetailsOpen(true); // Open IssueDetails modal
  const handleIssueDetailsClose = () => setIsIssueDetailsOpen(false); // Close IssueDetails modal
  
  const handleIssueModalSubmit = (updatedOrderDetails, remarks) => {
    console.log("Issue reported:", updatedOrderDetails, remarks);
    setIssueReported(true); // Mark issue as reported after submission
    setIsIssueModalOpen(false); // Close the modal
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
                  <TableHeader>Quantity Shipped</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Total</TableHeader>
                </tr>
              </thead>
              <tbody>
                {orderDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.OUTBOUND_DETAILS_PROD_NAME}</TableCell>
                    <TableCell>{item.OUTBOUND_DETAILS_PROD_QTY}</TableCell>
                    <TableCell>
                      ₱{(Number(item.OUTBOUND_DETAILS_LINE_PRICE) || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      ₱{calculateItemTotal(item.OUTBOUND_DETAILS_PROD_QTY, item.OUTBOUND_DETAILS_LINE_PRICE).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ProductTable>

            <TotalSummary>
              <SummaryItem>
                <strong>Total Quantity:</strong> {totalQuantity}
              </SummaryItem>
              <SummaryItem>
                <strong>Total Amount:</strong>{" "}
                <HighlightedTotal>₱{totalAmount.toFixed(2)}</HighlightedTotal>
              </SummaryItem>
            </TotalSummary>

            <ProgressSection>
              <ProgressBar>
                <ProgressFiller progress={progress} />
              </ProgressBar>
              <ProgressText>{progress}%</ProgressText>
            </ProgressSection>

            <ModalFooter>
              {status === "Delivered with Issues" && !issueReported && (
                <IssueButton onClick={handleIssueModalOpen}>What's the issue?</IssueButton>
              )}
              {status === "Delivered with Issues" && issueReported && (
                <IssueButton onClick={handleIssueDetailsOpen}>Issue details</IssueButton>
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
          </>
        )}
      </Modal>

      {isIssueModalOpen && (
        <CustomerIssueModal
          orderDetails={orderDetails}
          onClose={handleIssueModalClose}
          onSubmit={handleIssueModalSubmit}
        />
      )}

      {isIssueDetailsOpen && (
        <IssueDetails onClose={handleIssueDetailsClose} />
      )}
    </>
  );
};

// Styled components
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

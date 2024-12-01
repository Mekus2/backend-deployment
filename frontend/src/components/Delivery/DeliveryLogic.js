// DeliveryLogic.js
import { useState, useEffect, useRef } from "react";
import { fetchCustomerDelDetails } from "../../api/CustomerDeliveryApi";
import { notify } from "../Layout/CustomToast";
import { jsPDF } from "jspdf";
import { logoBase64 } from "../../data/imageData";

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

const useDeliveryLogic = (delivery) => {
  const abortControllerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [status, setStatus] = useState("");
  const [receivedDate, setReceivedDate] = useState(
    delivery.OUTBOUND_DEL_DATE_CUST_RCVD || "Not Received"
  );
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false);
  const [issueReported, setIssueReported] = useState(false);

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
      newStatus = "Dispatched";
      notify.info("Delivery status updated to Dispatched.");
    } else if (status === "Dispatched") {
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

  const handleIssueModalOpen = () => setIsIssueModalOpen(true);
  const handleIssueModalClose = () => setIsIssueModalOpen(false);
  const handleIssueDetailsOpen = () => setIsIssueDetailsOpen(true);
  const handleIssueDetailsClose = () => setIsIssueDetailsOpen(false);

  const handleIssueModalSubmit = (updatedOrderDetails, remarks) => {
    console.log("Issue reported:", updatedOrderDetails, remarks);
    setIssueReported(true);
    setIsIssueModalOpen(false);
  };

  const generateInvoice = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal", "utf-8");
    doc.addImage(logoBase64, "PNG", 12, 5, 12, 12);
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PHILVETS", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Customer: ${delivery.CUSTOMER_NAME}`, 20, 40);
    doc.text(`City: ${delivery.OUTBOUND_DEL_CITY}`, 20, 45);
    doc.text(`Province: ${delivery.OUTBOUND_DEL_PROVINCE}`, 20, 50);
    doc.text(`Delivery Status: ${status}`, 20, 55);
    doc.text(`Shipped Date: ${delivery.OUTBOUND_DEL_SHIPPED_DATE}`, 20, 60);
    doc.text(`Received Date: ${receivedDate}`, 20, 65);
    doc.autoTable({
      startY: 70,
      head: [["Product Name", "Quantity Shipped", "Price", "Total"]],
      body: orderDetails.map((item) => [
        item.OUTBOUND_DETAILS_PROD_NAME,
        item.OUTBOUND_DETAILS_PROD_QTY,
        Number(item.OUTBOUND_DETAILS_SELL_PRICE).toFixed(2),
        calculateItemTotal(
          item.OUTBOUND_DETAILS_PROD_QTY,
          item.OUTBOUND_DETAILS_SELL_PRICE
        ).toFixed(2),
      ]),
      styles: {
        fontSize: 10,
        halign: "center",
        valign: "middle",
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [0, 196, 255],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
    });
    doc.text(
      `Total Quantity: ${totalQuantity}`,
      20,
      doc.autoTable.previous.finalY + 10
    );
    doc.text(
      `Total Amount: ${totalAmount.toFixed(2)}`,
      20,
      doc.autoTable.previous.finalY + 15
    );
    doc.save("Invoice.pdf");
  };

  return {
    loading,
    error,
    orderDetails,
    status,
    receivedDate,
    progress,
    handleStatusChange,
    handleIssueModalOpen,
    handleIssueModalClose,
    handleIssueDetailsOpen,
    handleIssueDetailsClose,
    handleIssueModalSubmit,
    generateInvoice,
  };
};

export default useDeliveryLogic;

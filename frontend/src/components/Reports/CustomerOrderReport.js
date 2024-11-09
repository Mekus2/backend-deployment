import React, { useState } from "react";
import ReportBody from "./ReportBody";
import { SALES_ORDER } from "../../data/CustomerOrderData"; // Correctly importing the named export
import generatePDF from "./GeneratePdf";
import generateExcel from "./GenerateExcel";
import PreviewModal from "./PreviewModal";

// Utility function to format currency
const formatCurrency = (amount) => {
  return `₱${Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CustomerOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [excelData, setExcelData] = useState(null);

  // Helper function to search in all fields
  const matchesSearchTerm = (order) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      order.SALES_ORDER_ID.toString().toLowerCase().includes(searchStr) ||
      order.CLIENT_ID.toString().toLowerCase().includes(searchStr) ||
      order.SALES_ORDER_PYMNT_STAT.toLowerCase().includes(searchStr) ||
      order.SALES_ORDER_DLVRY_DATE.toLowerCase().includes(searchStr) ||
      order.SALES_ORDER_TOT_QTY.toString().toLowerCase().includes(searchStr) ||
      order.SALES_ORDER_PROD_TOTAL.toString().toLowerCase().includes(searchStr)
    );
  };

  // Filter and sort orders based on search term and date range
  const filteredOrders = SALES_ORDER
    .filter((order) => {
      const matchesDateRange =
        (!startDate || new Date(order.SALES_ORDER_DLVRY_DATE) >= new Date(startDate)) &&
        (!endDate || new Date(order.SALES_ORDER_DLVRY_DATE) <= new Date(endDate));
      return matchesSearchTerm(order) && matchesDateRange;
    })
    .sort((a, b) => new Date(b.SALES_ORDER_DLVRY_DATE) - new Date(a.SALES_ORDER_DLVRY_DATE)); // Sort by delivery date descending

  const totalOrders = filteredOrders.length;
  const totalOrderValue = filteredOrders.reduce(
    (acc, order) => acc + (order.SALES_ORDER_PROD_TOTAL || 0),
    0
  );

  // Map the filtered orders to display only the necessary fields
  const tableData = filteredOrders.map((order) => [
    order.SALES_ORDER_ID,
    order.CLIENT_ID,
    order.SALES_ORDER_PYMNT_STAT,
    order.SALES_ORDER_DLVRY_DATE,
    order.SALES_ORDER_TOT_QTY,
    formatCurrency(order.SALES_ORDER_PROD_TOTAL), // Format order amount with commas
  ]);

  // Updated header to match the requested fields
  const header = [
    "Order ID",
    "Client ID",
    "Payment Status",
    "Delivery Date",
    "Quantity",
    "Order Amount",
  ];

  const handlePreviewPDF = () => {
    const pdfData = generatePDF(
      header,
      tableData,
      totalOrders,
      totalOrderValue
    );
    setPdfContent(pdfData);
    setExcelData(null);
    setIsModalOpen(true);
  };

  const handlePreviewExcel = () => {
    setExcelData({
      header,
      rows: tableData,
      totalOrders, // Pass total orders
      totalAmount: totalOrderValue, // Pass total amount
    });
    setPdfContent("");
    setIsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfContent;
    link.download = "customer_order_report.pdf";
    link.click();
    setIsModalOpen(false);
  };

  const handleDownloadExcel = async () => {
    try {
      const excelBlobData = await generateExcel(
        header,
        tableData,
        totalOrders,
        totalOrderValue
      ); // Ensure this returns the Blob
      const url = URL.createObjectURL(excelBlobData);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customer_order_report.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  return (
    <>
      <ReportBody
        title="Customer Order Report"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        headers={header}
        rows={tableData}
        totalOrders={totalOrders}
        totalOrderValue={totalOrderValue}
        onDownloadPDF={handlePreviewPDF}
        onPreviewExcel={handlePreviewExcel}
      />

      <PreviewModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        pdfContent={pdfContent}
        excelData={excelData}
        onDownloadPDF={handleDownloadPDF}
        onDownloadExcel={handleDownloadExcel}
      />
    </>
  );
};

export default CustomerOrderReport;

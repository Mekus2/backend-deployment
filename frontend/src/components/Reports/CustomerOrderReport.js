import React, { useState } from "react";
import { SALES_ORDR } from "../../data/CusOrderData"; // Importing the static data
import ReportBody from "./ReportBody";
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
      order.CUSTOMER_NAME.toLowerCase().includes(searchStr) ||
      order.CUSTOMER_LOCATION.toLowerCase().includes(searchStr) ||
      order.SALES_ORDER_DATE.toLowerCase().includes(searchStr) ||
      order.SALES_ORDER_COST.toFixed(2).includes(searchStr) ||
      order.SALES_ORDER_REVENUE.toFixed(2).includes(searchStr) ||
      (order.SALES_ORDER_REVENUE - order.SALES_ORDER_COST)
        .toFixed(2)
        .includes(searchStr) // Gross Profit search
    );
  };

  // Filter and sort orders based on search term and date range
  const filteredOrders = SALES_ORDR.filter((order) => {
    const matchesDateRange =
      (!startDate || new Date(order.SALES_ORDER_DATE) >= new Date(startDate)) &&
      (!endDate || new Date(order.SALES_ORDER_DATE) <= new Date(endDate));
    return matchesSearchTerm(order) && matchesDateRange;
  }).sort(
    (a, b) => new Date(b.SALES_ORDER_DATE) - new Date(a.SALES_ORDER_DATE)
  ); // Sort by order date descending

  const totalOrders = filteredOrders.length;
  const totalGrossProfit = filteredOrders.reduce(
    (acc, order) => acc + (order.SALES_ORDER_REVENUE - order.SALES_ORDER_COST), // Calculate Gross Profit
    0
  );

  // Map the filtered orders to display the necessary fields, excluding Quantity
  const tableData = filteredOrders.map((order) => [
    order.CUSTOMER_NAME,
    order.CUSTOMER_LOCATION,
    order.SALES_ORDER_DATE,
    formatCurrency(order.SALES_ORDER_REVENUE), // Swap Revenue and Cost
    formatCurrency(order.SALES_ORDER_COST), // Swap Revenue and Cost
    formatCurrency(order.SALES_ORDER_REVENUE - order.SALES_ORDER_COST), // Gross Profit Calculation
  ]);

  // Updated header to match the requested fields, excluding Quantity
  const header = [
    "Customer",
    "Location",
    "Date",
    "Revenue", // Revenue now shown in Cost column
    "Cost", // Cost now shown in Revenue column
    "Gross Profit", // Gross Profit calculated as Revenue - Cost
  ];

  const handlePreviewPDF = () => {
    const pdfData = generatePDF(
      header,
      tableData,
      totalOrders,
      totalGrossProfit // Update to reflect Gross Profit total
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
      totalAmount: totalGrossProfit, // Pass total Gross Profit
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
        totalGrossProfit // Update to reflect Gross Profit total
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
        totalOrderValue={totalGrossProfit} // Use Gross Profit instead of Order Value
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

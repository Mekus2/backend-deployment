import React, { useState, useEffect } from "react";
import ReportBody from "./ReportBody";
import generatePDF from "./GeneratePdf";
import generateExcel from "./GenerateExcel";
import PreviewModal from "./PreviewModal";

const SupplierOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [orders, setOrders] = useState([]); // State for holding orders data

  // Fetch data from the API
 // Fetch data from the API
useEffect(() => {
  const fetchOrders = async () => {
    if (!startDate || !endDate) return; // Prevent fetching when dates are not set

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/delivery/supplier/dateRange/?start_date=${startDate}&end_date=${endDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data); // Assuming the API response is an array of orders
      } else {
        console.error("Failed to fetch orders data");
      }
    } catch (error) {
      console.error("Error fetching orders data:", error);
    }
  };

  fetchOrders();
}, [startDate, endDate]); // Re-run fetch when startDate or endDate changes

  // Helper function to search in all fields
  const matchesSearchTerm = (order) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      order.INBOUND_DEL_SUPP_NAME.toLowerCase().includes(searchStr) ||
      order.INBOUND_DEL_ORDER_DATE_CREATED.toLowerCase().includes(searchStr) ||
      order.INBOUND_DEL_TOTAL_RCVD_QTY.toString().includes(searchStr) ||
      order.INBOUND_DEL_TOTAL_PRICE.toString().includes(searchStr) ||
      order.INBOUND_DEL_STATUS.toLowerCase().includes(searchStr)
    );
  };

  // Helper function to format statuses (capitalizing first letter)
  const formatStatus = (status) => {
    if (!status) return "Pending"; // Default to "Pending" if status is undefined or null
    return status
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  // Function to format the order date (display only the date)
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Handle null or undefined date
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Default format: MM/DD/YYYY
  };

  // Ensure orders is an array before using filter
  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const matchesDateRange =
          (!startDate ||
            new Date(order.INBOUND_DEL_ORDER_DATE_CREATED) >= new Date(startDate)) &&
          (!endDate ||
            new Date(order.INBOUND_DEL_ORDER_DATE_CREATED) <= new Date(endDate));
        return matchesSearchTerm(order) && matchesDateRange;
      }).sort(
        (a, b) =>
          new Date(b.INBOUND_DEL_ORDER_DATE_CREATED) - new Date(a.INBOUND_DEL_ORDER_DATE_CREATED)
      )
    : []; // Fallback to empty array if it's not an array

  const totalOrders = filteredOrders.length;

  // Calculate total price (negative) for display
  const totalOrderValue = filteredOrders.reduce(
    (acc, order) => acc + parseFloat(order.INBOUND_DEL_TOTAL_PRICE || 0),
    0
  );

  // Map the filtered orders to display necessary fields and calculate gross profit
  const tableData = filteredOrders.map((order) => {
    const grossProfit =
      parseFloat(order.INBOUND_DEL_TOTAL_PRICE) - parseFloat(order.INBOUND_DEL_TOTAL_RCVD_QTY);
    return [
      order.INBOUND_DEL_SUPP_NAME, // Supplier
      formatDate(order.INBOUND_DEL_ORDER_DATE_CREATED), // Order Date, formatted to show only date
      `₱${parseFloat(order.INBOUND_DEL_TOTAL_PRICE).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`, // Total Price
      order.INBOUND_DEL_STATUS, // Status
    ];
  });

  // Updated header to match the requested fields
  const header = ["Supplier", "Order Date", "Total Price", "Status"];

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
      totalAmount: totalOrderValue, // Pass total amount as negative
    });
    setPdfContent("");
    setIsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfContent;
    link.download = "supplier_order_report.pdf";
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
      );
      const url = URL.createObjectURL(excelBlobData);
      const a = document.createElement("a");
      a.href = url;
      a.download = "supplier_order_report.xlsx";
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
        title="Supplier Order Report"
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

export default SupplierOrderReport;

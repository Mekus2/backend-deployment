import React, { useState } from "react";
import ReportBody from "./ReportBody";
import PURCHASE_ORDR from "../../data/SuppOrderData"; // Corrected import
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

  // Helper function to search in all fields
  const matchesSearchTerm = (order) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      order.SUPPLIER_NAME.toLowerCase().includes(searchStr) ||
      order.PURCHASE_ORDER_DATE.toLowerCase().includes(searchStr) ||
      order.PURCHASE_ORDER_QTY.toString().includes(searchStr) ||
      order.PURCHASE_ORDER_COST.toString().includes(searchStr) ||
      order.PURCHASE_ORDER_REVENUE.toString().includes(searchStr) ||
      order.PURCHASE_ORDER_DISCOUNT.toString().includes(searchStr)
    );
  };

  // Ensure PURCHASE_ORDR is an array before using filter
  const filteredOrders = Array.isArray(PURCHASE_ORDR)
    ? PURCHASE_ORDR.filter((order) => {
        const matchesDateRange =
          (!startDate ||
            new Date(order.PURCHASE_ORDER_DATE) >= new Date(startDate)) &&
          (!endDate ||
            new Date(order.PURCHASE_ORDER_DATE) <= new Date(endDate));
        return matchesSearchTerm(order) && matchesDateRange;
      }).sort(
        (a, b) =>
          new Date(b.PURCHASE_ORDER_DATE) - new Date(a.PURCHASE_ORDER_DATE)
      )
    : []; // Fallback to empty array if it's not an array

  const totalOrders = filteredOrders.length;

  // Calculate total order value (as negative)
  const totalOrderValue = -filteredOrders.reduce(
    (acc, order) => acc + (order.PURCHASE_ORDER_REVENUE || 0),
    0
  );

  // Map the filtered orders to display necessary fields and calculate gross profit
  const tableData = filteredOrders.map((order) => {
    const grossProfit =
      order.PURCHASE_ORDER_REVENUE -
      order.PURCHASE_ORDER_COST -
      order.PURCHASE_ORDER_DISCOUNT;
    return [
      order.SUPPLIER_NAME, // CUSTOMER
      order.PURCHASE_ORDER_DATE, // DATE
      `₱${order.PURCHASE_ORDER_COST.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`, // COST
      `₱${order.PURCHASE_ORDER_REVENUE.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`, // REVENUE
      `₱${grossProfit.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`, // GROSS PROFIT
    ];
  });

  // Updated header to match the requested fields
  const header = ["Supplier", "Order Date", "Cost", "Revenue", "Gross Profit"];

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

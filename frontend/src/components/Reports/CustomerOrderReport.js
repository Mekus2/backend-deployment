import React, { useState, useEffect } from "react";
import { SALES_ORDR } from "../../data/CusOrderData"; // Importing the static data
import ReportBody from "./ReportBody";
import generatePDF from "./GeneratePdf";
import generateExcel from "./GenerateExcel";
import PreviewModal from "./PreviewModal";
import { FetchSalesReport } from "../../api/SalesInvoiceApi";
import { resolvePath } from "react-router-dom";

// Utility function to format currency
const formatCurrency = (amount) => {
  return `₱${Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return ""; // Return empty string if invalid date
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

const CustomerOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermType, setSearchTermType] = useState(""); // Can be 'customer', 'date', 'city', 'province'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [tableData, setTableData] = useState([]); // Holds the report data
  const [resultsData, setResultsData] = useState([]);

  const header = [
    "Customer",
    "Location",
    "Date",
    "Revenue",
    "Cost",
    "Gross Profit",
  ];

  const totalOrders = tableData.length;
  const totalGrossProfit = resultsData.reduce(
    (acc, order) =>
      acc + (order.SALES_INV_TOTAL_GROSS_REVENUE - order.SALES_INV_TOTAL_PRICE),
    0
  );

  // Fetch sales report data based on searchTerm and searchTermType
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await FetchSalesReport({
          searchTerm,
          searchTermType,
          startDate,
          endDate,
          page: 1, // Pagination can be added as needed
        });

        // Map the response to match table data
        const mappedData = response.results.map((order) => [
          order.CLIENT_NAME,
          order.CLIENT_CITY,
          formatDate(order.SALES_INV_DATETIME),
          formatCurrency(order.SALES_INV_TOTAL_GROSS_REVENUE), // Revenue now shown in Cost column
          formatCurrency(order.SALES_INV_TOTAL_PRICE), // Cost now shown in Revenue column
          formatCurrency(order.SALES_INV_TOTAL_GROSS_INCOME), // Gross Profit Calculation
        ]);

        console.log("Fetched Data:", response.results);
        setResultsData(response.results);
        setTableData(mappedData);
      } catch (error) {
        console.error("Error fetching sales report:", error);
      }
    };

    if (searchTerm) {
      fetchData();
    }
  }, [searchTerm, searchTermType, startDate, endDate]);

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
        totalOrderValue={totalGrossProfit}
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

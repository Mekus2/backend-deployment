import React, { useState } from "react";
import ReportBody from "./ReportBody"; // Ensure you have this component
import { SALES_ORDR } from "../../data/CusOrderData"; // Import customer orders data
import PURCHASE_ORDR from "../../data/SuppOrderData"; // Import purchase orders data as default export
import { DAILY_REPORT } from "../../data/DailyReportData";
import { generatePDF, generateExcel } from "./GenerateAllOrdersExport"; // Import the combined export functions
import PreviewAllOrderModal from "./PreviewAllOrderModal"; // Updated import
import styled from "styled-components";

const AllOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [excelData, setExcelData] = useState(null);

  // // Combine customer and purchase orders
  // const combinedOrders = [];

  // // Process customer orders (Sales Orders)
  // SALES_ORDR.forEach((order) => {
  //   const grossProfit = order.SALES_ORDER_REVENUE - order.SALES_ORDER_COST;
  //   combinedOrders.push({
  //     type: "Sales",
  //     date: new Date(order.SALES_ORDER_DATE),
  //     cost: order.SALES_ORDER_COST,
  //     revenue: order.SALES_ORDER_REVENUE,
  //     grossProfit,
  //   });
  // });

  // // Process purchase orders (Supplier Orders)
  // PURCHASE_ORDR.forEach((order) => {
  //   const grossProfit =
  //     order.PURCHASE_ORDER_REVENUE - order.PURCHASE_ORDER_COST;
  //   combinedOrders.push({
  //     type: "Purchase",          
  //     date: new Date(order.PURCHASE_ORDER_DATE),
  //     cost: order.PURCHASE_ORDER_COST,
  //     revenue: order.PURCHASE_ORDER_REVENUE,
  //     grossProfit,
  //   });
  // });

  // Process daily reports 
  const dailyOrders = DAILY_REPORT.map((report) => ({
    type: "Daily",
    date: new Date(), // Assuming the report is from today
    productName: report.PRODUCT_NAME,
    openingQty: report.OPENING_QTY,
    soldQty: report.SOLD_QTY,
    deliveredQty: report.DELIVERED_QTY,
    totalQty: report.TOTAL_QTY,
  }));

  // Filter combined orders based on search term and date range
  const filteredOrders = dailyOrders
    .filter((order) => {
      const matchesSearchTerm =
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.openingQty.toString().includes(searchTerm.toLowerCase()) ||
        order.soldQty.toString().includes(searchTerm.toLowerCase()) ||
        order.deliveredQty.toString().includes(searchTerm.toLowerCase()) ||
        order.totalQty.toString().includes(searchTerm.toLowerCase());

      const matchesDateRange =
        (!startDate || order.date >= new Date(startDate)) &&
        (!endDate || order.date <= new Date(endDate));

      return matchesSearchTerm && matchesDateRange;
    })
    .sort((a, b) => b.date - a.date); // Sort by date descending

  const totalOrders = filteredOrders.length;

  // Calculate total quantities
  const totalOpeningQty = filteredOrders.reduce(
    (acc, order) => acc + order.openingQty,
    0
  );
  const totalSoldQty = filteredOrders.reduce(
    (acc, order) => acc + order.soldQty,
    0
  );
  const totalDeliveredQty = filteredOrders.reduce(
    (acc, order) => acc + order.deliveredQty,
    0
  );
  const totalQty = filteredOrders.reduce(
    (acc, order) => acc + order.totalQty,
    0
  );

  // // Calculate total sales and expenses based on filtered orders
  // const totalSales = filteredOrders.reduce(
  //   (acc, order) => acc + (order.revenue > 0 ? order.revenue : 0),
  //   0
  // ); // Sum only sales from filtered orders

  // const totalExpenses = filteredOrders.reduce(
  //   (acc, order) => acc + (order.cost > 0 ? order.cost : 0),
  //   0
  // ); // Sum only expenses from filtered orders

  // const netProfit = totalSales - totalExpenses; // Net profit from filtered orders

  // // Format number with currency and thousand separators
  // const formatCurrency = (value) => {
  //   return `₱${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  // };

  // Map the filtered orders to display necessary fields
  const tableData = filteredOrders.map((order) => [
    order.productName || "N/A", 
    order.openingQty || 0,     
    order.soldQty || 0,        
    order.deliveredQty || 0,   
    order.totalQty || 0 
  ]);

  const header = ["Product Name", "Opening Qty", "Sold Qty", "Delivered Qty", "Total Qty"];

  const handlePreviewPDF = async () => {
    const pdfData = await generatePDF(
      header,
      tableData,
      totalOrders,
      totalOpeningQty,
      totalSoldQty,
      totalDeliveredQty,
      totalQty
    );
    setPdfContent(pdfData);
    setExcelData(null);
    setIsModalOpen(true);
  };

  const handlePreviewExcel = async () => {
    const excelBlobData = await generateExcel(
      header,
      tableData,
      totalOrders,
      totalOpeningQty,
      totalSoldQty,
      totalDeliveredQty,
      totalQty
    );
    const url = URL.createObjectURL(excelBlobData);
    setExcelData({
      header,
      rows: tableData,
      totalOpeningQty,
      totalSoldQty,
      totalDeliveredQty,
      totalQty,
      url,
    });
    setPdfContent("");
    setIsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfContent;
    link.download = "DailyReport.pdf";
    link.click();
    setIsModalOpen(false);
  };

  const handleDownloadExcel = () => {
    if (!excelData) return; // Ensure there is data to download
    const link = document.createElement("a");
    link.href = excelData.url;
    link.download = "DailyReport.xlsx";
    link.click();
    setIsModalOpen(false);
  };

  return (
    <>
      <CardContainer>
        <Card>
          <CardTitle>Total Opening Qty</CardTitle>
          <CardValue color="#f08400">{totalOpeningQty}</CardValue>
        </Card>
        <Card>
          <CardTitle>Total Sold Qty</CardTitle>
          <CardValue color="#ff5757">{totalSoldQty}</CardValue>
        </Card>
        <Card>
          <CardTitle>Total Delivered Qty</CardTitle>
          <CardValue color="#1DBA0B">{totalDeliveredQty}</CardValue>
        </Card>
        <Card>
          <CardTitle>Total Qty</CardTitle>
          <CardValue color="#4caf50">{totalQty}</CardValue>
        </Card>
      </CardContainer>

      <ReportBody
        title="All Order Report"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        headers={header}
        rows={tableData}
        totalOrders={totalOrders}
        totalOrderValue={totalQty} // Update to show total quantity
        onDownloadPDF={handlePreviewPDF}
        onPreviewExcel={handlePreviewExcel}
      />

      <PreviewAllOrderModal
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

// Styled components for the cards
const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allow the cards to wrap when they don't fit */
  justify-content: space-between; /* Distribute space between the cards */
  margin-bottom: 10px;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  flex: 1 1 300px; /* Grow and shrink with a base size of 300px */
  min-width: 250px; /* Set minimum width for cards */
  margin: 5px; /* Add margin for spacing */
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
`;

const CardValue = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => props.color || "#4caf50"};
`;

export default AllOrderReport;

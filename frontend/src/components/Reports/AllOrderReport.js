import React, { useState, useEffect } from "react";
import ReportBody from "./ReportBody"; // Ensure you have this component
import { generatePDF, generateExcel } from "./GenerateAllOrdersExport"; // Import the combined export functions
import PreviewAllOrderModal from "./PreviewAllOrderModal"; // Updated import
import styled from "styled-components";
import axios from "axios"; // For API calls

const AllOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [tableData, setTableData] = useState([]); // Table rows
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // Fetch both viewDaily and currentStock data
        const [viewDailyResponse, currentStockResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/report/viewdaily/"),
          axios.get("http://127.0.0.1:8000/report/current/"),
        ]);
  
        const viewDailyData = viewDailyResponse.data;
        const currentStockData = currentStockResponse.data;   
        
        console.log('opening stock:', viewDailyResponse.data);
        console.log('current stock:', currentStockResponse.data);

        // Map current stock to its corresponding product in the daily data
        const combinedData = viewDailyData.map((daily) => {
          const currentStock = currentStockData.find(
            (current) => current.product_name === daily.product_name
          )?.current_stock || 0; // Default to 0 if not found
        
          return {
            product: daily.product_name,
            date: daily.date,
            openingStock: daily.opening_stock,
            currentStock: currentStock,
          };
        });
        
  
        setTableData(combinedData); // Set combined data in table
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Format number with currency and thousand separators
  const formatCurrency = (value) => {
    return `₱${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const header = [
    "Product",
    "Date",
    "Opening Stock",
    "Current Stock",
  ];

  // const handlePreviewPDF = async () => {
  //   const pdfData = await generatePDF(header, tableData);
  //   setPdfContent(pdfData);
  //   setExcelData(null);
  //   setIsModalOpen(true);
  // };

  // const handlePreviewExcel = async () => {
  //   const excelBlobData = await generateExcel(header, tableData);
  //   const url = URL.createObjectURL(excelBlobData);
  //   setExcelData({
  //     header,
  //     rows: tableData,
  //     url,
  //   });
  //   setPdfContent("");
  //   setIsModalOpen(true);
  // };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfContent;
    link.download = "OrderReport.pdf";
    link.click();
    setIsModalOpen(false);
  };

  const handleDownloadExcel = () => {
    if (!excelData) return; // Ensure there is data to download
    const link = document.createElement("a");
    link.href = excelData.url;
    link.download = "OrderReport.xlsx";
    link.click();
    setIsModalOpen(false);
  };

  return (
    <>
      {/* <CardContainer>
        <Card>
          <CardTitle>Total Products</CardTitle>
          <CardValue color="#f08400">{tableData.length}</CardValue>
        </Card>
      </CardContainer> */}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ReportBody
          title="Stock Report"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          headers={header}
          rows={tableData.map((row) => [
            row.product,
            row.date,
            row.openingStock,
            row.currentStock,
            // row.gross,
          ])}
        //  totalOrders={tableData.length}
          totalOrderValue={tableData.reduce(
            (acc, row) => acc + row.gross,
            0
          )} // Calculate total gross
          // onDownloadPDF={handlePreviewPDF}
          // onPreviewExcel={handlePreviewExcel}
        />
      )}

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

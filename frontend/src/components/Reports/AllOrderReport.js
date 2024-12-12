import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { generatePDF, generateExcel } from "./GenerateAllOrdersExport";
import PreviewAllOrderModal from "./PreviewAllOrderModal";
import axios from "axios"; // For API calls
import Table from "../Layout/Table";
import SearchBar from "../Layout/SearchBar";
import Button from "../Layout/Button";
import ReportCard from "../Layout/ReportCard";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";

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

        const [viewDailyResponse, currentStockResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/report/viewdaily/"),
          axios.get("http://127.0.0.1:8000/report/current/"),
        ]);

        const viewDailyData = viewDailyResponse.data;
        const currentStockData = currentStockResponse.data;

        const combinedData = viewDailyData.map((daily) => {
          const currentStock = currentStockData.find(
            (current) => current.product_name === daily.product_name
          )?.current_stock || 0;

          return {
            product: daily.product_name,
            date: daily.date,
            openingStock: daily.opening_stock,
            currentStock: currentStock,
          };
        });

        setTableData(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const header = ["Product", "Date", "Opening Stock", "Current Stock"];
// Handle PDF Preview
const handlePreviewPDF = async () => {
  const validTableData = tableData.map((row) => [
    row.product || "N/A", // Fallback value if undefined
    row.date || "N/A", // Fallback value if undefined
    row.openingStock || 0, // Fallback value if undefined
    row.currentStock || 0, // Fallback value if undefined
  ]);

  try {
    const pdfData = await generatePDF(header, validTableData);
    setPdfContent(pdfData); // Set the generated PDF content
    setExcelData(null); // Clear any Excel data
    setIsModalOpen(true); // Open preview modal
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

// Handle Excel Preview
const handlePreviewExcel = async () => {
  const validTableData = tableData.map((row) => [
    row.product || "N/A", // Fallback value if undefined
    row.date || "N/A", // Fallback value if undefined
    row.openingStock || 0, // Fallback value if undefined
    row.currentStock || 0, // Fallback value if undefined
  ]);

  try {
    const excelData = await generateExcel(header, validTableData);
    setExcelData(excelData); // Set the generated Excel data
    setPdfContent(null); // Clear any PDF content
    setIsModalOpen(true); // Open preview modal
  } catch (error) {
    console.error("Error generating Excel:", error);
  }
};


  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfContent;
    link.download = "DailyReport.pdf";
    link.click();
    setIsModalOpen(false);
  };

  const handleDownloadExcel = () => {
    if (!excelData) return;
    const link = document.createElement("a");
    link.href = excelData.url;
    link.download = "DailyReport.xlsx";
    link.click();
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <CardsContainer>
        <ReportCard
          label="Total Products"
          value={`${tableData.length} Products`}
          startDate={startDate ? formatDate(startDate) : ""}
          endDate={endDate ? formatDate(endDate) : ""}
          icon={<FaShoppingCart />}
        />
        <ReportCard
          label="Order Value"
          value={`₱${tableData.reduce((acc, row) => acc + (row.gross || 0), 0).toFixed(2)}`}
          startDate={startDate ? formatDate(startDate) : ""}
          endDate={endDate ? formatDate(endDate) : ""}
          icon={<FaDollarSign />}
        />
      </CardsContainer>

      <Controls>
        <SearchBar
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DateContainer>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </DateContainer>
      </Controls>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ReportContent>
          <Table
            headers={header}
            rows={tableData.map((row) => [
              row.product,
              row.date,
              row.openingStock,
              row.currentStock,
            ])}
          />
        </ReportContent>
      )}

      {/* <DownloadButtons>
        <Button variant="primary" onClick={handlePreviewPDF}>
          Preview PDF
        </Button>
        <Button variant="primary" onClick={handlePreviewExcel}>
          Preview Excel
        </Button>
      </DownloadButtons> */}

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

// Styled Components
const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const DateContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;

  label {
    display: flex;
    align-items: center;
    font-weight: bold;
  }

  input {
    margin-left: 0.5rem;
    padding: 0.3rem;
    border-radius: 3px;
    border: 1px solid #ccc;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    margin-top: 0;

    label {
      margin-left: 1rem;
    }
  }
`;

const ReportContent = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  min-height: 200px;
  text-align: center;
`;

const DownloadButtons = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`;

export default AllOrderReport;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import Button from "../Layout/Button";
import ReportCard from "../Layout/ReportCard";
import { FaTruck, FaDollarSign } from "react-icons/fa";
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
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!startDate || !endDate) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/delivery/supplier/dateRange/?start_date=${startDate}&end_date=${endDate}`
        );
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error("Failed to fetch orders data");
        }
      } catch (error) {
        console.error("Error fetching orders data:", error);
      }
    };

    fetchOrders();
  }, [startDate, endDate]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredOrders = Array.isArray(orders)
    ? orders
        .filter((order) => {
          const matchesDateRange =
            (!startDate ||
              new Date(order.INBOUND_DEL_ORDER_DATE_CREATED) >=
                new Date(startDate)) &&
            (!endDate ||
              new Date(order.INBOUND_DEL_ORDER_DATE_CREATED) <= new Date(endDate));
          return matchesSearchTerm(order) && matchesDateRange;
        })
        .sort(
          (a, b) =>
            new Date(b.INBOUND_DEL_ORDER_DATE_CREATED) -
            new Date(a.INBOUND_DEL_ORDER_DATE_CREATED)
        )
    : [];

  const header = ["Supplier", "Order Date", "Total Price", "Status"];

  const tableData = filteredOrders.map((order) => [
    order.INBOUND_DEL_SUPP_NAME,
    formatDate(order.INBOUND_DEL_ORDER_DATE_CREATED),
    `₱${parseFloat(order.INBOUND_DEL_TOTAL_PRICE).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    order.INBOUND_DEL_STATUS,
  ]);

  const totalOrders = filteredOrders.length;

  const totalOrderValue = filteredOrders.reduce(
    (acc, order) => acc + parseFloat(order.INBOUND_DEL_TOTAL_PRICE || 0),
    0
  );

  const handlePreviewPDF = () => {
    const pdfData = generatePDF(header, tableData, totalOrders, totalOrderValue);
    setPdfContent(pdfData);
    setExcelData(null);
    setIsModalOpen(true);
  };

  const handlePreviewExcel = () => {
    setExcelData({
      header,
      rows: tableData,
      totalOrders,
      totalAmount: totalOrderValue,
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
      <CardsContainer>
        <ReportCard
          label={`Total Orders`}
          value={`${totalOrders} Orders`}
          startDate={startDate ? formatDate(startDate) : ""}
          endDate={endDate ? formatDate(endDate) : ""}
          icon={<FaTruck />}
        />
        <ReportCard
          label={`Order Value`}
          value={`₱${totalOrderValue.toFixed(2)}`}
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

      <ReportContent>
        <Table headers={header} rows={tableData} />
      </ReportContent>

      <DownloadButtons>
        <Button variant="primary" onClick={handlePreviewPDF}>
          Preview PDF
        </Button>
        <Button variant="primary" onClick={handlePreviewExcel}>
          Preview Excel
        </Button>
      </DownloadButtons>

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

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    justify-content: center;
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

export default SupplierOrderReport;

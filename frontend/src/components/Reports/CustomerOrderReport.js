import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import Button from "../Layout/Button";
import ReportCard from "../Layout/ReportCard";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";
import generatePDF from "./GeneratePdf";
import generateExcel from "./GenerateExcel";
import PreviewModal from "./PreviewModal";

const CustomerOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchFilter, setSearchFilter] = useState("Customer");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!startDate || !endDate) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/delivery/customer/dateRange/?start_date=${startDate}&end_date=${endDate}`
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
    const customerName = order.OUTBOUND_DEL_CUSTOMER_NAME || "";
    const status = order.OUTBOUND_DEL_STATUS || "";
    const city = order.OUTBOUND_DEL_CITY || "";
    const province = order.OUTBOUND_DEL_PROVINCE || "";
    const orderDate = formatDate(order.OUTBOUND_DEL_CREATED);

    switch (searchFilter) {
      case "Date":
        return orderDate.includes(searchStr);
      case "Customer":
        return customerName.toLowerCase().includes(searchStr);
      case "City":
        return city.toLowerCase().includes(searchStr);
      case "Province":
        return province.toLowerCase().includes(searchStr);
      default:
        return false;
    }
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
              new Date(order.OUTBOUND_DEL_CREATED) >= new Date(startDate)) &&
            (!endDate ||
              new Date(order.OUTBOUND_DEL_CREATED) <= new Date(endDate));
          return matchesSearchTerm(order) && matchesDateRange;
        })
        .sort(
          (a, b) =>
            new Date(b.OUTBOUND_DEL_CREATED) - new Date(a.OUTBOUND_DEL_CREATED)
        )
    : [];

  const groupByCustomer = (orders) => {
    return orders.reduce((acc, order) => {
      const customerName = order.OUTBOUND_DEL_CUSTOMER_NAME;
      if (!acc[customerName]) {
        acc[customerName] = {
          totalPrice: 0,
          orderCount: 0,
          status: order.OUTBOUND_DEL_STATUS,
          orders: [],
        };
      }
      acc[customerName].totalPrice += parseFloat(
        order.OUTBOUND_DEL_TOTAL_PRICE || 0
      );
      acc[customerName].orderCount += 1;
      acc[customerName].orders.push(order);
      return acc;
    }, {});
  };

  const groupedCustomerData = groupByCustomer(filteredOrders);
  const header = ["Customer", "Order Date", "Total Price", "Status"];

  const tableData = filteredOrders.map((order) => [
    order.OUTBOUND_DEL_CUSTOMER_NAME,
    formatDate(order.OUTBOUND_DEL_CREATED),
    `₱${parseFloat(order.OUTBOUND_DEL_TOTAL_PRICE).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    order.OUTBOUND_DEL_STATUS,
  ]);

  const totalOrders = filteredOrders.length;
  const totalOrderValue = filteredOrders.reduce(
    (acc, order) => acc + parseFloat(order.OUTBOUND_DEL_TOTAL_PRICE || 0),
    0
  );

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
      totalOrders,
      totalAmount: totalOrderValue,
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
      );
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
      <CardsContainer>
        <ReportCard
          label={`Total Orders`}
          value={`${totalOrders} Orders`}
          startDate={startDate ? formatDate(startDate) : ""}
          endDate={endDate ? formatDate(endDate) : ""}
          icon={<FaShoppingCart />}
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
        <SearchAndDropdownContainer>
          <SearchBar
            placeholder={`Search by ${searchFilter.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Dropdown>
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            >
              <option value="Date">Date</option>
              <option value="Customer">Customer</option>
              <option value="City">City</option>
              <option value="Province">Province</option>
            </select>
          </Dropdown>
        </SearchAndDropdownContainer>
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

const Dropdown = styled.div`

  select {
    padding: 9px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 14px;
  }
`;

const SearchAndDropdownContainer = styled.div`
  display: flex;
  align-items: center;
  width: 500px;
  justify-content: flex-start;
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

export default CustomerOrderReport;

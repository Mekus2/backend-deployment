import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import ReportCard from "../Layout/ReportCard";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";
// import { SALES_ORDR } from "../../data/CusOrderData"; // Import customer orders data
// import PURCHASE_ORDR from "../../data/SuppOrderData"; // Import purchase orders data
import Button from "../Layout/Button"; // Import the Button component
import SalesDetailsModal from "./SalesDetailsModal"; // Import SalesDetailsModal component

const SharedSalesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for controlling modal visibility
  const [selectedOrder, setSelectedOrder] = useState(null); // State to store selected order for details
  const [salesInvoice, setSalesInvoices] = useState([]);

  const combinedOrders = [];

  useEffect(() => {
    const fetchSalesInvoices = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/sales/list/"); // Your API endpoint for sales invoices
        const data = await response.json();

        // Assuming the fetched data is an array of sales invoices, set it to the state
        setSalesInvoices(data.results);
        console.log("Received Invoice list:", data.results);

        // setCombinedOrders(allOrders);
      } catch (error) {
        console.error("Error fetching sales invoices:", error);
      }
    };

    fetchSalesInvoices();
  }, []);

  const totalOrders = salesInvoice.length;
  const totalSales = salesInvoice.reduce(
    (acc, order) => acc + (order.revenue > 0 ? order.revenue : 0),
    0
  );

  const formatCurrency = (value) => {
    // Ensure the value is a number and fallback to 0 if it's not a valid number
    const numberValue = isNaN(value) ? 0 : Number(value);
    return `₱${numberValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };
  // Prepare table data with required columns: TYPE, DATE, COST, REVENUE, GROSS PROFIT, ACTION (Details Button)
  const tableData = salesInvoice.map((order) => [
    order.SALES_INV_ID || "N/A", // Sales Invoice ID
    order.SALES_INV_DATETIME
      ? new Date(order.SALES_INV_DATETIME).toISOString().slice(0, 10) // Convert to Date if necessary
      : "N/A", // Format date as YYYY-MM-DD
    order.CLIENT_NAME || "Unknown", // Client Name
    formatCurrency(order.SALES_INV_AMOUNT_BALANCE || 0), // Balance (Total Amount Balance)
    order.SALES_INV_PYMNT_STATUS || "Pending", // Payment Status
    <Button
      variant="primary"
      onClick={() => handleOpenModal(order)} // Pass the corresponding order to the modal
    >
      {console.log("Sent Invoice list:", order)}
      Details
    </Button>,
  ]);
  const header = [
    "Invoice ID",
    "Date",
    "Client Name",
    "Balance",
    "Status",
    "Action",
  ];

  const handleOpenModal = (order) => {
    setSelectedOrder(order); // Set the selected order to be shown in the modal
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedOrder(null); // Clear selected order
  };

  return (
    <>
      <CardsContainer>
        <ReportCard
          label="Total Orders"
          value={`${totalOrders} Orders`}
          icon={<FaShoppingCart />}
        />
        <ReportCard
          label="Revenue"
          value={formatCurrency(totalSales)}
          icon={<FaDollarSign />}
        />
        <ReportCard
          label="Cost"
          value={formatCurrency(0)} // totalExpense Here
          icon={<FaDollarSign />}
        />
        <ReportCard
          label="Gross Profit"
          value={formatCurrency()} // Net Profit here
          icon={<FaDollarSign />}
        />
      </CardsContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter orders..."
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

      {/* Conditional rendering of SalesDetailsModal */}
      {isModalOpen && selectedOrder && (
        <SalesDetailsModal
          onClose={handleCloseModal}
          sale={selectedOrder} // Ensure the sale data is passed to the modal
        />
      )}
      {console.log("Selected Order:", selectedOrder)}

      <ReportContent>
        <Table headers={header} rows={tableData} />
      </ReportContent>
    </>
  );
};

// Styled components
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

export default SharedSalesPage;

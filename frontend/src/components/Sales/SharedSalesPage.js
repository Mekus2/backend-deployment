import React, { useState } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import ReportCard from "../Layout/ReportCard";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";
import { SALES_ORDR } from "../../data/CusOrderData"; // Import customer orders data
import PURCHASE_ORDR from "../../data/SuppOrderData"; // Import purchase orders data

const SharedSalesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const combinedOrders = [];

  // Process sales orders
  SALES_ORDR.forEach((order) => {
    const grossProfit = order.SALES_ORDER_REVENUE - order.SALES_ORDER_COST;
    combinedOrders.push({
      type: "Sales",
      date: new Date(order.SALES_ORDER_DATE),
      cost: order.SALES_ORDER_COST,
      revenue: order.SALES_ORDER_REVENUE,
      grossProfit,
    });
  });

  // Process purchase orders
  PURCHASE_ORDR.forEach((order) => {
    const grossProfit =
      order.PURCHASE_ORDER_REVENUE - order.PURCHASE_ORDER_COST;
    combinedOrders.push({
      type: "Purchase",
      date: new Date(order.PURCHASE_ORDER_DATE),
      cost: order.PURCHASE_ORDER_COST,
      revenue: order.PURCHASE_ORDER_REVENUE,
      grossProfit,
    });
  });

  const filteredOrders = combinedOrders.filter((order) => {
    const matchesSearchTerm =
      order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cost.toString().includes(searchTerm.toLowerCase()) ||
      order.revenue.toString().includes(searchTerm.toLowerCase()) ||
      order.grossProfit.toString().includes(searchTerm.toLowerCase()) ||
      order.date.toISOString().slice(0, 10).includes(searchTerm.toLowerCase()); // Include date search

    const matchesDateRange =
      (!startDate || order.date >= new Date(startDate)) &&
      (!endDate || order.date <= new Date(endDate));

    return matchesSearchTerm && matchesDateRange;
  });

  // Sort orders by date descending
  const sortedOrders = filteredOrders.sort((a, b) => b.date - a.date);

  const totalOrders = sortedOrders.length;
  const totalSales = sortedOrders.reduce(
    (acc, order) => acc + (order.revenue > 0 ? order.revenue : 0),
    0
  );
  const totalExpenses = sortedOrders.reduce(
    (acc, order) => acc + (order.cost > 0 ? order.cost : 0),
    0
  );
  const netProfit = totalSales - totalExpenses;

  const formatCurrency = (value) => {
    return `₱${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Prepare table data with required columns: TYPE, DATE, COST, REVENUE, GROSS PROFIT
  const tableData = sortedOrders.map((order) => [
    order.type,
    order.date.toISOString().slice(0, 10), // Format date as YYYY-MM-DD
    formatCurrency(order.cost),
    formatCurrency(order.revenue),
    formatCurrency(order.grossProfit),
  ]);

  const header = ["Type", "Date", "Cost", "Revenue", "Gross Profit"];

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
          value={formatCurrency(-totalExpenses)} // Negative value for cost
          icon={<FaDollarSign />}
        />
        <ReportCard
          label="Gross Profit"
          value={formatCurrency(netProfit)}
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

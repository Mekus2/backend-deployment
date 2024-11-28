import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AddCustomerOrderModal from "./AddCustomerOrderModal";
import SearchBar from "../../../components/Layout/SearchBar";
import Table from "../../../components/Layout/Table";
import CardTotalCustomerOrder from "../../../components/CardsData/CardTotalCustomerOrder";
import Button from "../../../components/Layout/Button";
import { fetchCustomerOrders } from "../../../api/fetchCustomerOrders";
import { FaPlus } from "react-icons/fa";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import CustomerOrderDetailsModal from "./CustomerOrderDetailsModal";
import Loading from "../../../components/Layout/Loading"; // Import the Loading component
import { TotalSection, TotalRow } from "../OrderStyles";

const SharedCustomerOrdersPage = ({ userRole }) => {
  const [customer, setCustomer] = useState([]); // Use customer data instead of orders
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddingCustomerOrder, setIsAddingCustomerOrder] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "SALES_ORDER_DATE_CREATED",
    direction: "desc", // Default to descending
  });
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    refreshOrders();
    console.log(`Logged User Role: ${userRole}`);
  }, [userRole]); // Include userRole as a dependency

  const refreshOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomerOrders();
      setCustomer(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error refreshing customer orders:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Return empty string if invalid date
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const filteredSales = customer.filter((sale) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      String(sale.CLIENT_ID)?.toLowerCase().includes(lowerCaseSearchTerm) ||
      sale.SALES_ORDER_DATACREATED.toLowerCase().includes(
        lowerCaseSearchTerm
      ) ||
      String(sale.SALES_ORDER_PYMNT_STAT)
        ?.toLowerCase()
        .includes(lowerCaseSearchTerm)
    );
  });

  const sortedSales = filteredSales.sort((a, b) => {
    if (sortConfig.key === "SALES_ORDER_DATE_CREATED") {
      // Always sort in descending order by date
      return new Date(b.SALES_ORDER_DATE_CREATED) - new Date(a.SALES_ORDER_DATE_CREATED);
    }
    return (
      a.SALES_ORDER_CLIENT_NAME.localeCompare(b.SALES_ORDER_CLIENT_NAME) *
      (sortConfig.direction === "asc" ? 1 : -1)
    );
  });

  const openDetailsModal = (sale) => setSelectedOrder(sale);
  const closeDetailsModal = () => setSelectedOrder(null);

  const openAddCustomerOrderModal = () => setIsAddingCustomerOrder(true);
  const closeAddCustomerOrderModal = () => {
    setIsAddingCustomerOrder(false);
    refreshOrders(); // Refresh orders when modal is closed
  };

  const headers = [
    "Order ID",
    "Customer Name",
    "Order Date",
    "Payment Status",
    "Action",
  ];

  const rows = sortedSales.map((sale) => [
    sale.SALES_ORDER_ID,
    sale.SALES_ORDER_CLIENT_NAME,
    formatDate(sale.SALES_ORDER_DATE_CREATED), // Show formatted order creation date
    <Status status={sale.SALES_ORDER_STATUS}>{sale.SALES_ORDER_STATUS}</Status>, // Example status mapping
    <Button onClick={() => openDetailsModal(sale)} fontSize="14px">
      Details
    </Button>,
  ]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return <Loading />; // Show the loading component when data is being fetched
  }

  return (
    <>
      <AnalyticsContainer>
        <CardTotalCustomerOrder />
      </AnalyticsContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <StyledButton onClick={openAddCustomerOrderModal}>
          <FaPlus className="icon" /> Customer Order
        </StyledButton>
      </Controls>
      <Table
        headers={headers.map((header, index) => (
          <TableHeader
            key={index}
            onClick={() => {
              if (header === "Order Date" || header === "Client ID") {
                handleSort(
                  header === "Order Date"
                    ? "SALES_ORDER_DATE_CREATED"
                    : "SALES_ORDER_ID"
                );
              }
            }}
          >
            {header}
            {(header === "Order Date" || header === "Client ID") && (
              <>
                {sortConfig.key ===
                (header === "Order Date"
                  ? "SALES_ORDER_DATE_CREATED"
                  : "SALES_ORDER_CLIENT_NAME") ? (
                  sortConfig.direction === "asc" ? (
                    <FaChevronUp
                      style={{ marginLeft: "5px", fontSize: "12px" }}
                    />
                  ) : (
                    <FaChevronDown
                      style={{ marginLeft: "5px", fontSize: "12px" }}
                    />
                  )
                ) : (
                  <span style={{ opacity: 0.5 }}>
                    <FaChevronUp
                      style={{ marginLeft: "5px", fontSize: "12px" }}
                    />
                    <FaChevronDown
                      style={{ marginLeft: "5px", fontSize: "12px" }}
                    />
                  </span>
                )}
              </>
            )}
          </TableHeader>
        ))}
        rows={rows}
      />
      {selectedOrder && (
        <CustomerOrderDetailsModal
          order={selectedOrder}
          onClose={closeDetailsModal}
          userRole={userRole}
        />
      )}
      {isAddingCustomerOrder && (
        <AddCustomerOrderModal onClose={closeAddCustomerOrderModal} />
      )}
    </>
  );
};

// Styled Components
const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const Status = styled.span`
  background-color: ${(props) =>
    props.status === "Accepted"
      ? "#1DBA0B"
      : props.status === "Pending"
      ? "#f08400"
      : "#ff5757"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;

  .icon {
    font-size: 20px;
    margin-right: 8px;
  }
`;

const TableHeader = styled.th`
  text-align: center;
  cursor: ${(props) =>
    props.children[0] === "Client ID" || props.children[0] === "Order Date"
      ? "pointer"
      : "default"};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SharedCustomerOrdersPage;

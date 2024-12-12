import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SupplierOrderDetailsModal from "./SupplierOrderDetailsModal";
import AddSupplierOrderModal from "./AddSupplierOrderModal";
import SearchBar from "../../Layout/SearchBar";
import Table from "../../Layout/Table";
import CardTotalSupplierOrder from "../../../components/CardsData/CardTotalSupplierOrder";
import Button from "../../Layout/Button";
import { FaPlus, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { fetchPurchaseOrders } from "../../../api/fetchPurchaseOrders";
import Loading from "../../../components/Layout/Loading"; // Import the Loading component

const SharedSupplierOrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddingSupplierOrder, setIsAddingSupplierOrder] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "PURCHASE_ORDER_DATE",
    direction: "desc",
  });
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); // Start loading
      try {
        const data = await fetchPurchaseOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      } finally {
        setLoading(false); // Stop loading when done
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // Return empty string if invalid date
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Filter orders based on search term
  const filteredOrders = (orders || []).filter((order) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      order.PURCHASE_ORDER_SUPPLIER_ID.toString().includes(
        lowerCaseSearchTerm
      ) ||
      formatDate(order.PURCHASE_ORDER_DATE_CREATED)
        .toLowerCase()
        .includes(lowerCaseSearchTerm) ||
      order.PURCHASE_ORDER_STATUS.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const sortedOrders = filteredOrders.sort((a, b) => {
    if (sortConfig.key === "PURCHASE_ORDER_DATE_CREATED") {
      // Always sort in descending order by date
      return (
        new Date(b.PURCHASE_ORDER_DATE_CREATED) -
        new Date(a.PURCHASE_ORDER_DATE_CREATED)
      );
    }
    if (sortConfig.key === "PURCHASE_ORDER_ID") {
      // Always sort in descending order by ID
      return b.PURCHASE_ORDER_ID - a.PURCHASE_ORDER_ID;
    }
    // Always sort in descending order by Supplier ID
    return b.PURCHASE_ORDER_SUPPLIER_ID - a.PURCHASE_ORDER_SUPPLIER_ID;
  });

  const openDetailsModal = (order) => setSelectedOrder(order);
  const closeDetailsModal = () => setSelectedOrder(null);
  const openAddSupplierOrderModal = () => setIsAddingSupplierOrder(true);
  const closeAddSupplierOrderModal = () => setIsAddingSupplierOrder(false);

  const headers = [
    "Order ID",
    "Supplier Name",
    "Order Date",
    "Order Status",
    "Action",
  ];

  // Rows for the table
  const rows = sortedOrders.map((order) => {
    return [
      order.PURCHASE_ORDER_ID,
      order.PURCHASE_ORDER_SUPPLIER_CMPNY_NAME, // Display supplier ID
      formatDate(order.PURCHASE_ORDER_DATE_CREATED),
      <Status status={order.PURCHASE_ORDER_STATUS || "Pending"}>
        {order.PURCHASE_ORDER_STATUS || "Pending"}
      </Status>, // Display status with styled status component
      <Button onClick={() => openDetailsModal(order)} fontSize="14px">
        Details
      </Button>,
    ];
  });

  // Handle sort
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
        <div onClick={() => navigate("/staff/orders/purchase-order")}>
          <CardTotalSupplierOrder />
        </div>
      </AnalyticsContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter purchase orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <StyledButton onClick={openAddSupplierOrderModal}>
          <FaPlus className="icon" /> Supplier Order
        </StyledButton>
      </Controls>
      <Table
        headers={headers.map((header, index) => (
          <TableHeader
            key={index}
            onClick={() => {
              if (
                header === "Order Date" ||
                header === "Supplier Name" ||
                header === "Order ID"
              ) {
                handleSort(
                  header === "Order Date"
                    ? "PURCHASE_ORDER_DATE"
                    : header === "Supplier Name"
                    ? "Supp_Company_Name" // Updated to SUPP_COMPANY_NAME
                    : "PURCHASE_ORDER_ID"
                );
              }
            }}
          >
            {header}
            {(header === "Order Date" ||
              header === "Supplier Name" ||
              header === "Order ID") && (
              <>
                {sortConfig.key ===
                (header === "Order Date"
                  ? "PURCHASE_ORDER_DATE_CREATED"
                  : "PURCHASE_ORDER_ID") ? (
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
        <SupplierOrderDetailsModal
          order={selectedOrder}
          onClose={closeDetailsModal}
        />
      )}
      {isAddingSupplierOrder && (
        <AddSupplierOrderModal onClose={closeAddSupplierOrderModal} />
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
      : (props.status === props.status) === "In Progress"
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
    props.children[0] === "Supplier ID" || props.children[0] === "Order Date"
      ? "pointer"
      : "default"};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SharedSupplierOrderPage;

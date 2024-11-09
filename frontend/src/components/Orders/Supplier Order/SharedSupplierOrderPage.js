import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SupplierOrderDetailsModal from "./SupplierOrderDetailsModal";
import AddSupplierOrderModal from "./AddSupplierOrderModal";
import SearchBar from "../../Layout/SearchBar";
import Table from "../../Layout/Table";
import CardTotalSupplierOrder from "../../../components/CardsData/CardTotalSupplierOrder";
import Button from "../../Layout/Button";
import PURCHASE_ORDERS from "../../../data/SupplierOrderData"; // Make sure this path is correct
import { FaPlus, FaChevronUp, FaChevronDown } from "react-icons/fa";

const SharedSupplierOrderPage = () => {
  const navigate = useNavigate();
  const [orders] = useState(PURCHASE_ORDERS); // Use PURCHASE_ORDERS directly
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddingSupplierOrder, setIsAddingSupplierOrder] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "PURCHASE_ORDER_DATE",
    direction: "desc",
  });

  // Filter orders based on search term
  const filteredOrders = (orders || []).filter((order) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      order.SUPPLIER_ID.toString().includes(lowerCaseSearchTerm) ||
      order.PURCHASE_ORDER_DATE.toLowerCase().includes(lowerCaseSearchTerm) ||
      order.PURCHASE_ORDER_STATUS.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  // Sort the filtered orders based on sort configuration
  const sortedOrders = filteredOrders.sort((a, b) => {
    if (sortConfig.key === "PURCHASE_ORDER_DATE") {
      return (
        (new Date(b.PURCHASE_ORDER_DATE) - new Date(a.PURCHASE_ORDER_DATE)) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    }
    if (sortConfig.key === "PURCHASE_ORDER_ID") {
      return (
        (a.PURCHASE_ORDER_ID - b.PURCHASE_ORDER_ID) *
        (sortConfig.direction === "asc" ? 1 : -1)
      );
    }
    return a.SUPPLIER_ID - b.SUPPLIER_ID; // Sorting by Supplier ID
  });

  const openDetailsModal = (order) => setSelectedOrder(order);
  const closeDetailsModal = () => setSelectedOrder(null);
  const openAddSupplierOrderModal = () => setIsAddingSupplierOrder(true);
  const closeAddSupplierOrderModal = () => setIsAddingSupplierOrder(false);

  const headers = ["Supplier ID", "Order Date", "Status", "Action"];

  // Rows for the table
  const rows = sortedOrders.map((order) => {
    return [
      order.SUPPLIER_ID, // Display supplier ID
      order.PURCHASE_ORDER_DATE,
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

  return (
    <>
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
      <AnalyticsContainer>
        <div onClick={() => navigate("/admin/orders/purchase-order")}>
          <CardTotalSupplierOrder />
        </div>
      </AnalyticsContainer>
      <Table
        headers={headers.map((header, index) => (
          <TableHeader
            key={index}
            onClick={() => {
              if (header === "Order Date" || header === "Supplier ID") {
                handleSort(
                  header === "Order Date"
                    ? "PURCHASE_ORDER_DATE"
                    : "PURCHASE_ORDER_ID"
                );
              }
            }}
          >
            {header}
            {(header === "Order Date" || header === "Supplier ID") && (
              <>
                {sortConfig.key ===
                (header === "Order Date"
                  ? "PURCHASE_ORDER_DATE"
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
    props.status === "Completed"
      ? "#1DBA0B"
      : props.status === "Pending" || props.status === "In Progress"
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

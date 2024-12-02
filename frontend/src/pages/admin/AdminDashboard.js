// src/components/AdminDashboard.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
//import HighestSellingProducts from "../../components/Dashboard/HighestSellingProducts";
//import RecentlyAddedProducts from "../../components/Dashboard/RecentlyAddedProducts";
import LowestStocks from "../../components/Dashboard/LowestStocks";
//import CardLowStocks from "../../components/CardsData/CardLowStocks";
import CardTotalProducts from "../../components/CardsData/CardTotalProducts";
import CardTotalCustomerOrder from "../../components/CardsData/CardTotalCustomerOrder";
import CardTotalCustomers from "../../components/CardsData/CardTotalCustomers";
import CardTotalDelivery from "../../components/CardsData/CardTotalDelivery";
import CardTotalReturns from "../../components/CardsData/CardTotalReturns";
import CardTotalLogs from "../../components/CardsData/CardTotalLogs"; // Add logs card
import CardTotalSuppliers from "../../components/CardsData/CardTotalSuppliers"; // Add suppliers card
import CardTotalStaffs from "../../components/CardsData/CardTotalStaffs"; // Add users card
import CardTotalSupplierOrder from "../../components/CardsData/CardTotalSupplierOrder"; // Add purchase order card
//import CardTotalNotification from "../../components/CardsData/CardTotalNotification"; // Add notifications card
import { getLayout } from "../../utils/indexedDB";
import MainLayout from "../../components/Layout/MainLayout";
import Loading from "../../components/Layout/Loading";
import { checkUserAccess } from "../../api/authUtils";

const AdminDashboard = () => {
  checkUserAccess();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const cardComponents = {
    CardTotalProducts: <CardTotalProducts />,
   // CardLowStocks: <CardLowStocks />,
    CardTotalCustomerOrder: <CardTotalCustomerOrder />,
    CardTotalCustomers: <CardTotalCustomers />,
    CardTotalDelivery: <CardTotalDelivery />,
    CardTotalReturns: <CardTotalReturns />,
    CardTotalLogs: <CardTotalLogs />, // Add logs card
    CardTotalSuppliers: <CardTotalSuppliers />, // Add suppliers card
    CardTotalStaffs: <CardTotalStaffs />, // Add users card
    CardTotalSupplierOrder: <CardTotalSupplierOrder />, // Add purchase order card
    // CardTotalNotification: <CardTotalNotification />,
  };

  const tableComponents = {
   // HighestSellingProducts: <HighestSellingProducts />,
  //  RecentlyAddedProducts: <RecentlyAddedProducts />,
    LowestStocks: <LowestStocks />,
  };

  // Set your desired card order
  const currentCardOrder = [
    "CardTotalProducts",
    "CardLowStocks",
    "CardTotalCustomerOrder",
    "CardTotalCustomers",
    "CardTotalDelivery",
    "CardTotalReturns",
    "CardTotalLogs", // Add logs to the order
    "CardTotalSuppliers", // Add suppliers to the order
    "CardTotalStaffs", // Add users to the order
    "CardTotalSupplierOrder", // Add purchase order to the order
    "CardTotalNotification", // Add notifications to the order
  ];

  // Set your desired table order
  const tableOrder = [
    "HighestSellingProducts",
    "RecentlyAddedProducts",
    "LowestStocks",
  ];

  const cardOnClickHandlers = {
    CardTotalProducts: () => navigate("/admin/products"),
    CardLowStocks: () => navigate("/admin/inventory"),
    CardTotalCustomerOrder: () => navigate("/admin/customer-order"),
    CardTotalCustomers: () => navigate("/admin/customers"),
    CardTotalDelivery: () => navigate("/admin/delivery"),
    CardTotalReturns: () => navigate("/admin/issues"),
    CardTotalLogs: () => navigate("/admin/logs"), // Update as necessary
    CardTotalSuppliers: () => navigate("/admin/suppliers"), // Update as necessary
    CardTotalStaffs: () => navigate("/admin/users"), // Update as necessary
    CardTotalSupplierOrder: () => navigate("/admin/purchase-orders"), // Update as necessary
    CardTotalNotification: () => navigate("/admin/notifications"), // Update as necessary
  };

  const tableOnClickHandlers = {
    HighestSellingProducts: () => navigate("/admin/products"),
    RecentlyAddedProducts: () => navigate("/admin/products"),
    LowestStocks: () => navigate("/admin/inventory"),
  };

  useEffect(() => {
    const loadLayout = async () => {
      setLoading(true);
      try {
        await getLayout("admin", "cardOrder");
        await getLayout("admin", "tableOrder");
        // No layout saving/loading since we're not implementing drag-and-drop
      } catch (error) {
        console.error("Error loading layout:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLayout();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <MainLayout>
      <CardContainer>
        {currentCardOrder.map((cardKey) => (
          <CardWrapper key={cardKey} onClick={cardOnClickHandlers[cardKey]}>
            {cardComponents[cardKey]}
          </CardWrapper>
        ))}
      </CardContainer>

      <ScrollableTablesContainer>
        <TablesContainer>
          {tableOrder.map((tableKey) => (
            <Row key={tableKey} onClick={tableOnClickHandlers[tableKey]}>
              {tableComponents[tableKey]}
            </Row>
          ))}
        </TablesContainer>
      </ScrollableTablesContainer>
    </MainLayout>
  );
};

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 auto;
  gap: 1rem;
  width: 100%;
`;

const CardWrapper = styled.div`
  cursor: pointer; // Updated to pointer for better UX
`;

const ScrollableTablesContainer = styled.div`
  overflow-x: auto;
  margin: 2rem auto;
  width: 100%;
  padding: 7px;
`;

const TablesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 488px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  cursor: pointer; // Updated to pointer for better UX
`;

export default AdminDashboard;

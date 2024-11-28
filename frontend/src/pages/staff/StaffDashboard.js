// src/components/StaffDashboard.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CardTotalReturns from "../../components/CardsData/CardTotalReturns";
import CardTotalCustomerOrder from "../../components/CardsData/CardTotalCustomerOrder";
import CardTotalDelivery from "../../components/CardsData/CardTotalDelivery";
import CardLowStocks from "../../components/CardsData/CardLowStocks";
import CardTotalProducts from "../../components/CardsData/CardTotalProducts";
import CardTotalCustomers from "../../components/CardsData/CardTotalCustomers";
//import CardTotalNotification from "../../components/CardsData/CardTotalNotification"; // Add this import
// import CardTotalCategories from "../../components/CardsData/CardTotalCategories"; // Add this import
import LowestStocks from "../../components/Dashboard/LowestStocks"; // Add this import for low stock table
import ExpiredItemsAlert from "../../components/Dashboard/ExpiredItemsAlert"; // Add this import for expired items
import { getLayout } from "../../utils/indexedDB";
import MainLayout from "../../components/Layout/MainLayout";
import Loading from "../../components/Layout/Loading";
import { checkUserAccess } from "../../api/authUtils";

const StaffDashboard = () => {
  checkUserAccess();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const cardComponents = {
    CardTotalProducts: <CardTotalProducts />,
    CardLowStocks: <CardLowStocks />,
    CardTotalCustomers: <CardTotalCustomers />,
    CardTotalCustomerOrder: <CardTotalCustomerOrder />,
    CardTotalReturns: <CardTotalReturns />,
    CardTotalDelivery: <CardTotalDelivery />,
  //  CardTotalNotification: <CardTotalNotification />,
    // CardTotalCategories: <CardTotalCategories />, // Add categories card
  };

  const tableComponents = {
    LowestStocks: <LowestStocks />,
    ExpiredItemsAlert: <ExpiredItemsAlert />,
  };

  const cardOrder = Object.keys(cardComponents);
  const tableOrder = Object.keys(tableComponents); // Get all table keys from the tableComponents object

  const cardOnClickHandlers = {
    CardTotalProducts: () => navigate("/staff/products"),
    CardLowStocks: () => navigate("/staff/inventory"),
    CardTotalCustomers: () => navigate("/staff/customers"),
    CardTotalCustomerOrder: () => navigate("/staff/customer-order"),
    CardTotalReturns: () => navigate("/staff/returns"),
    CardTotalDelivery: () => navigate("/staff/delivery"),
    CardTotalNotification: () => navigate("/staff/notifications"), // Update as necessary
    CardTotalCategories: () => navigate("/staff/categories"), // Update as necessary
  };

  const tableOnClickHandlers = {
    LowestStocks: () => navigate("/staff/inventory"), // Update as necessary
    ExpiredItemsAlert: () => navigate("/staff/inventory"), // Update as necessary
  };

  useEffect(() => {
    const loadLayout = async () => {
      setLoading(true);
      try {
        await getLayout("staff", "cardOrder");
        // No layout saving/loading as we're not implementing drag-and-drop
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
        {cardOrder.map((cardKey) => (
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

export default StaffDashboard;

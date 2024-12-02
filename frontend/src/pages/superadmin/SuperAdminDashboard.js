// src/components/SuperAdminDashboard.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
//import HighestSellingProducts from "../../components/Dashboard/HighestSellingProducts";
//import RecentlyAddedProducts from "../../components/Dashboard/RecentlyAddedProducts";
import LowestStocks from "../../components/Dashboard/LowestStocks";
//import CardLowStocks from "../../components/CardsData/CardLowStocks";
import CardTotalProducts from "../../components/CardsData/CardTotalProducts";
import CardTotalSales from "../../components/CardsData/CardTotalSales";
import CardTotalInventoryValue from "../../components/CardsData/CardTotalInventoryValue";
import CardTotalCustomerOrder from "../../components/CardsData/CardTotalCustomerOrder";
import CardTotalCustomers from "../../components/CardsData/CardTotalCustomers";
import CardTotalDelivery from "../../components/CardsData/CardTotalDelivery";
import CardTotalLogs from "../../components/CardsData/CardTotalLogs";
import CardTotalSupplierOrder from "../../components/CardsData/CardTotalSupplierOrder";
import CardTotalReturns from "../../components/CardsData/CardTotalReturns";
import CardTotalSuppliers from "../../components/CardsData/CardTotalSuppliers";
import CardTotalTransactions from "../../components/CardsData/CardTotalTransactions";
import CardTotalUsers from "../../components/CardsData/CardTotalUsers";
import ExpiredItemsAlert from "../../components/Dashboard/ExpiredItemsAlert";
import { getLayout, saveLayout } from "../../utils/indexedDB";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import MainLayout from "../../components/Layout/MainLayout";
import Loading from "../../components/Layout/Loading";
import ResetLayout from "../../utils/ResetLayout";
import { checkUserAccess } from "../../api/authUtils";

const SuperAdminDashboard = () => {
  checkUserAccess();
  const navigate = useNavigate();
  const [currentCardOrder, setCurrentCardOrder] = useState([
    "CardTotalProducts",
   // "CardLowStocks",
    "CardTotalInventoryValue",
    "CardTotalCustomerOrder",
    "CardTotalCustomers",
    "CardTotalDelivery",
    "CardTotalLogs",
    "CardTotalSupplierOrder",
    "CardTotalReturns",
    "CardTotalSuppliers",
    "CardTotalTransactions",
    "CardTotalUsers",
    "CardTotalSales",
  ]);

  const [tableOrder, setTableOrder] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const loadLayout = async () => {
      setLoading(true); // Start loading
      try {
        const savedCardOrder = await getLayout("superadmin", "cardOrder");
        const savedTableOrder = await getLayout("superadmin", "tableOrder");

        if (savedCardOrder) {
          setCurrentCardOrder(savedCardOrder);
        }

        if (savedTableOrder) {
          setTableOrder(savedTableOrder);
        } else {
          setTableOrder([
            "HighestSellingProducts",
            "ExpiredItemsAlert",
            "RecentlyAddedProducts",
            "LowestStocks",
          ]);
        }
      } catch (error) {
        console.error("Error loading layout:", error);
      } finally {
        setLoading(false); // Ensure loading is stopped even if there's an error
      }
    };

    loadLayout();
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (result.type === "CARD") {
      const newOrder = Array.from(currentCardOrder);
      const [removed] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(destinationIndex, 0, removed);
      setCurrentCardOrder(newOrder);
      saveLayout("superadmin", "cardOrder", newOrder);
    } else if (result.type === "TABLE") {
      const newTableOrder = Array.from(tableOrder);
      const [removed] = newTableOrder.splice(sourceIndex, 1);
      newTableOrder.splice(destinationIndex, 0, removed);
      setTableOrder(newTableOrder);
      saveLayout("superadmin", "tableOrder", newTableOrder);
    }
  };

  // Custom onClick handlers for cards (with superadmin role)
  const cardOnClickHandlers = {
    CardTotalProducts: () => navigate("/superadmin/products"),
    //CardLowStocks: () => navigate("/superadmin/inventory"),
    CardTotalInventoryValue: () => navigate("/superadmin/inventory"),
    CardTotalCustomerOrder: () => navigate("/superadmin/customer-order"),
    CardTotalCustomers: () => navigate("/superadmin/customers"),
    CardTotalDelivery: () => navigate("/superadmin/delivery"),
    CardTotalLogs: () => navigate("/superadmin/logs"),
    CardTotalSupplierOrder: () => navigate("/superadmin/purchase-order"),
    CardTotalReturns: () => navigate("/superadmin/issues"),
    CardTotalSuppliers: () => navigate("/superadmin/suppliers"),
    CardTotalTransactions: () => navigate("/superadmin/reports"),
    CardTotalUsers: () => navigate("/superadmin/users"),
    CardTotalSales: () => navigate("/superadmin/sales"),
  };

  // Custom onClick handlers for tables (with superadmin role)
  const tableOnClickHandlers = {
    HighestSellingProducts: () => navigate("/superadmin/products"),
    ExpiredItemsAlert: () => navigate("/superadmin/inventory"),
    RecentlyAddedProducts: () => navigate("/superadmin/products"),
    LowestStocks: () => navigate("/superadmin/inventory"),
  };

  const cardComponents = {
    CardTotalSales: <CardTotalSales />,
    CardTotalProducts: <CardTotalProducts />,
  //  CardLowStocks: <CardLowStocks />,
    CardTotalInventoryValue: <CardTotalInventoryValue />,
    CardTotalCustomerOrder: <CardTotalCustomerOrder />,
    CardTotalCustomers: <CardTotalCustomers />,
    CardTotalDelivery: <CardTotalDelivery />,
    CardTotalLogs: <CardTotalLogs />,
    CardTotalSupplierOrder: <CardTotalSupplierOrder />,
    CardTotalReturns: <CardTotalReturns />,
    CardTotalSuppliers: <CardTotalSuppliers />,
    CardTotalTransactions: <CardTotalTransactions />,
    CardTotalUsers: <CardTotalUsers />,
  };

  const tableComponents = {
    ExpiredItemsAlert: <ExpiredItemsAlert />,
    //HighestSellingProducts: <HighestSellingProducts />,
   // RecentlyAddedProducts: <RecentlyAddedProducts />,
    LowestStocks: <LowestStocks />,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <MainLayout>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="cards" direction="horizontal" type="CARD">
          {(provided) => (
            <CardContainer {...provided.droppableProps} ref={provided.innerRef}>
              {currentCardOrder.map((cardKey, index) => {
                if (cardComponents[cardKey]) {
                  return (
                    <Draggable
                      key={cardKey}
                      draggableId={cardKey}
                      index={index}
                    >
                      {(provided) => (
                        <CardWrapper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={cardOnClickHandlers[cardKey]}
                        >
                          {cardComponents[cardKey]}
                        </CardWrapper>
                      )}
                    </Draggable>
                  );
                }
                return null;
              })}
              {provided.placeholder}
            </CardContainer>
          )}
        </Droppable>

        <ScrollableTablesContainer>
          <Droppable droppableId="tables" type="TABLE">
            {(provided) => (
              <TablesContainer
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {tableOrder.map((tableKey, index) => {
                  if (tableComponents[tableKey]) {
                    return (
                      <Draggable
                        key={tableKey}
                        draggableId={tableKey}
                        index={index}
                      >
                        {(provided) => (
                          <Row
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={tableOnClickHandlers[tableKey]}
                          >
                            {tableComponents[tableKey]}
                          </Row>
                        )}
                      </Draggable>
                    );
                  }
                  return null;
                })}
                {provided.placeholder}
              </TablesContainer>
            )}
          </Droppable>
        </ScrollableTablesContainer>
      </DragDropContext>
      <ResetLayout
        setCurrentCardOrder={setCurrentCardOrder}
        setTableOrder={setTableOrder}
      />
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
  cursor: move;
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
  cursor: move;
`;

export default SuperAdminDashboard;

import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import MainLayout from "../../components/Layout/MainLayout";
import CardLowStocks from "../../components/CardsData/CardLowStocks";
import CardTotalCustomers from "../../components/CardsData/CardTotalCustomers";
import CardTotalDelivery from "../../components/CardsData/CardTotalDelivery";
import CardTotalProducts from "../../components/CardsData/CardTotalProducts";
import CardTotalReturns from "../../components/CardsData/CardTotalReturns";
import CardTotalNotification from "../../components/CardsData/CardTotalNotification";

const StaffReports = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <StatsContainer>
        <div onClick={() => navigate("/staff/inventory")}>
          <CardLowStocks />
        </div>
        <div onClick={() => navigate("/staff/customers")}>
          <CardTotalCustomers />
        </div>
        <div onClick={() => navigate("/staff/delivery")}>
          <CardTotalDelivery />
        </div>
        <div onClick={() => navigate("/staff/products")}>
          <CardTotalProducts />
        </div>
        <div onClick={() => navigate("/staff/issues")}>
          <CardTotalReturns />
        </div>
        <div onClick={() => navigate("/staff/notifications")}>
          <CardTotalNotification />
        </div>
      </StatsContainer>

      <StatsContainer>
        <StatsCard>
          <StatTitle>Pending Orders</StatTitle>
          <StatNumber color="black">15</StatNumber>
        </StatsCard>
        <StatsCard>
          <StatTitle>Customer Satisfaction</StatTitle>
          <StatNumber color="#1DBA0B">4.8/5</StatNumber>
        </StatsCard>
        <StatsCard>
          <StatTitle>Work Hours</StatTitle>
          <StatNumber color="#00C4FF">35 hrs</StatNumber>
        </StatsCard>
        <StatsCard>
          <StatTitle>Recent Activities</StatTitle>
          <StatNumber color="#ff3d3d">5 Activities</StatNumber>
        </StatsCard>
      </StatsContainer>

      <AlertsContainer>
        <AlertCard>
          <AlertTitle>Urgent Alerts</AlertTitle>
          <AlertContent>No new urgent alerts</AlertContent>
        </AlertCard>
        <AlertCard>
          <AlertTitle>System Updates</AlertTitle>
          <AlertContent>
            New update available. Check the system for details.
          </AlertContent>
        </AlertCard>
      </AlertsContainer>
    </MainLayout>
  );
};

// Styled components
const StatsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin: 2rem auto;
  max-width: 1000px;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatsCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  flex: 1;
  text-align: left;
  min-width: 220px;
  max-width: 220px;
`;

const StatTitle = styled.h3`
  font-size: 1rem;
  font-weight: 400;
`;

const StatNumber = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.color};
`;

const AlertsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 2rem auto;
  max-width: 1000px;
  gap: 1rem;
`;

const AlertCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const AlertTitle = styled.h3`
  font-size: 1rem;
  font-weight: 400;
`;

const AlertContent = styled.p`
  font-size: 1rem;
  color: #333;
`;

export default StaffReports;

import React, { useState } from "react";
import styled from "styled-components";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalLogs from "../../components/CardsData/CardTotalLogs";
import Button from "../../components/Layout/Button"; // Use Button component for tabs
import { logData } from "../../data/LogsData";
import { USER } from "../../data/UserData";
import { colors } from "../../colors"; // Assuming colors are available

const SharedLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("User Logs"); // State for active tab

  // Create a map to get user names based on USER_ID
  const userNames = USER.reduce((acc, user) => {
    acc[user.USER_ID] = `${user.USER_FIRSTNAME} ${user.USER_LASTNAME}`;
    return acc;
  }, {});

  // Filter logs based on active tab
  const filteredLogs =
    activeTab === "User Logs"
      ? logData.filter((log) => {
          const userName = userNames[log.USER_ID] || "Unknown User";
          return (
            log.LOG_TITLE.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.LOG_DESCRIPTION.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.LOG_DATETIME.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      : logData.filter((log) => log.LOG_TITLE.toLowerCase().includes(searchTerm.toLowerCase())); // Example filter for transaction logs

  // Update headers and rows dynamically based on active tab
  const headers =
    activeTab === "User Logs"
      ? ["Date & Time", "Title", "Description", "User"]
      : ["Date & Time", "Title", "Amount", "Status"]; // Example headers for transaction logs

  const rows =
    activeTab === "User Logs"
      ? filteredLogs.map((log) => [
          log.LOG_DATETIME,
          log.LOG_TITLE,
          log.LOG_DESCRIPTION,
          userNames[log.USER_ID] || "Unknown User",
        ])
      : filteredLogs.map((log) => [
          log.LOG_DATETIME,
          log.LOG_TITLE,
          log.LOG_DESCRIPTION,
          "Status Placeholder", // Example placeholder for transaction logs
        ]);

  return (
    <>
      <Tabs>
        <StyledTabButton
          active={activeTab === "User Logs"}
          onClick={() => setActiveTab("User Logs")}
        >
          User Logs
        </StyledTabButton>
        <StyledTabButton
          active={activeTab === "Transaction Logs"}
          onClick={() => setActiveTab("Transaction Logs")}
        >
          Transaction Logs
        </StyledTabButton>
      </Tabs>
      <Controls>
        <SearchBar
          placeholder={`Search / Filter ${activeTab.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>
      <AnalyticsContainer>
        <CardTotalLogs />
      </AnalyticsContainer>
      <Table headers={headers} rows={rows} />
    </>
  );
};

// Styled Components
const Tabs = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const StyledTabButton = styled(Button)`
  background-color: ${(props) => (props.active ? colors.primary : "#e0e0e0")};
  color: ${(props) => (props.active ? "#fff" : "#000")};
  border: none;
  margin-right: 8px;
  padding: 8px 16px;
  border-radius: 4px;
  &:hover {
    background-color: ${(props) =>
      props.active ? colors.primaryHover : "#c0c0c0"};
  }
`;

const Controls = styled.div`
  display: flex;
  justify-content: flex-start;
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

export default SharedLogsPage;

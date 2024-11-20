import React, { useState } from "react";
import styled from "styled-components";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalLogs from "../../components/CardsData/CardTotalLogs";
import { logData } from "../../data/LogsData";
import { USER } from "../../data/UserData";

const SharedLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Create a map to get user names based on USER_ID
  const userNames = USER.reduce((acc, user) => {
    acc[user.USER_ID] = `${user.USER_FIRSTNAME} ${user.USER_LASTNAME}`;
    return acc;
  }, {});

  const filteredLogs = logData.filter((log) => {
    const userName = userNames[log.USER_ID] || "Unknown User";
    return (
      log.LOG_TITLE.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.LOG_DESCRIPTION.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.LOG_DATETIME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) // Search by user name
    );
  });

  // Update headers to reflect 'User' instead of 'User ID'
  const headers = ["Date & Time", "Title", "Description", "User"];

  // Update rows to display user names instead of user IDs
  const rows = filteredLogs.map((log) => [
    log.LOG_DATETIME,
    log.LOG_TITLE,
    log.LOG_DESCRIPTION,
    userNames[log.USER_ID] || "Unknown User", // Display user name or fallback
  ]);

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search / Filter logs..."
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

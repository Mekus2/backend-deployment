import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalLogs from "../../components/CardsData/CardTotalLogs";
import { fetchLogs, fetchUserById } from "../../api/LogsApi"; // Updated imports

const SharedLogsPage = () => {
  const [logs, setLogs] = useState([]); // State for logs data
  const [userNames, setUserNames] = useState({}); // State to hold user names map
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch logs and user names
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch logs data
        const logData = await fetchLogs();
        setLogs(logData);

        // Fetch user names for each unique USER_ID in logs
        const uniqueUserIds = [...new Set(logData.map((log) => log.USER_ID))];
        const userMap = {};
        
        for (const userId of uniqueUserIds) {
          try {
            const user = await fetchUserById(userId);
            userMap[userId] = `${user.first_name} ${user.last_name}`;
          } catch (err) {
            console.error(`Failed to fetch user ${userId}`, err);
            userMap[userId] = "Unknown User";
          }
        }
        
        setUserNames(userMap);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logs based on search term
  const filteredLogs = logs.filter((log) => {
    const userName = userNames[log.USER_ID] || "Unknown User";
    return (
      log.LLOG_TYPE.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.LOG_DESCRIPTION.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.LOG_DATETIME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) // Search by user name
    );
  });

  // Define headers for the table
  const headers = ["Date & Time", "Type", "Description", "User"];

  // Map logs to table rows
  const rows = filteredLogs.map((log) => [
    log.LOG_DATETIME,
    log.LLOG_TYPE,
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
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <Table headers={headers} rows={rows} />
      )}
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

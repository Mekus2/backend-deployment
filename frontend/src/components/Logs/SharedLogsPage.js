import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table";
import CardTotalLogs from "../../components/CardsData/CardTotalLogs";
import Button from "../../components/Layout/Button"; // Use Button component for tabs
import { fetchLogsByType, fetchUserById } from "../../api/LogsApi"; // Import the new API function
import { colors } from "../../colors"; // Assuming colors are available

const SharedLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("User Logs"); // State for active tab
  const [logs, setLogs] = useState([]); // State to store logs
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [userDetails, setUserDetails] = useState({}); // State to store user details by ID

  // Fetch logs dynamically based on the active tab
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const logType = activeTab === "User Logs" ? "user" : "transaction";
        const data = await fetchLogsByType(logType);
        setLogs(data);

        // If it's user logs, fetch user details for each log
        if (activeTab === "User Logs") {
          for (const log of data) {
            if (log.USER_ID) {
              const userData = await fetchUserById(log.USER_ID); // Fetch user by ID
              setUserDetails((prevState) => ({
                ...prevState,
                [log.USER_ID]: `${userData.first_name} ${userData.last_name}`, // Store full name in userDetails
              }));
            }
          }
        }
      } catch (err) {
        setError("Failed to fetch logs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [activeTab]);

  // Update headers and rows dynamically based on active tab
  const headers =
    activeTab === "User Logs"
      ? ["Date & Time", "Type", "Description", "User"]
      : ["Date & Time", "Type", "Description", "User"];

  const rows = logs.map((log) => {
    return activeTab === "User Logs"
      ? [
          log.LOG_DATETIME,
          log.LLOG_TYPE,
          log.LOG_DESCRIPTION,
          userDetails[log.USER_ID] || "Unknown User", // Display user full name
        ]
      : [
          log.LOG_DATETIME,
          log.LLOG_TYPE,
          log.LOG_DESCRIPTION || "N/A",
          userDetails[log.USER_ID] || "Unknown User",
        ];
  });

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
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Table headers={headers} rows={rows} />
      )}
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

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../../components/Layout/SearchBar";
import Table from "../../components/Layout/Table_Pagination";
import Card from "../../components/Layout/Card"; // Import Card component
import Button from "../../components/Layout/Button"; // Use Button component for tabs
import Loading from "../../components/Layout/Loading"; // Import Loading component
import { fetchLogsByType, fetchUserById } from "../../api/LogsApi"; // Import the new API function
import { colors } from "../../colors"; // Assuming colors are available
import { FaListAlt } from "react-icons/fa"; // For the card icon

const SharedLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("User Logs");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPage = 10; // Number of rows per page

  // Fetch logs dynamically based on the active tab and pagination
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const logType = activeTab === "User Logs" ? "user" : "transaction";
        console.log(
          `Fetching logs for: ${logType}, Page: ${currentPage}, Rows per page: ${rowsPerPage}`
        );

        const data = await fetchLogsByType(logType, currentPage, rowsPerPage);
        console.log("Fetched logs data:", data);

        setLogs(data.results);
        setTotalRows(data.count);

        // If it's user logs, fetch user details for each log
        if (activeTab === "User Logs") {
          for (const log of data.results) {
            if (log.USER_ID) {
              console.log(`Fetching user details for USER_ID: ${log.USER_ID}`);

              const userData = await fetchUserById(log.USER_ID);
              console.log(
                `Fetched user details for USER_ID ${log.USER_ID}:`,
                userData
              );

              setUserDetails((prevState) => ({
                ...prevState,
                [log.USER_ID]: `${userData.first_name} ${userData.last_name}`,
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to fetch logs. Please try again.");
      } finally {
        setLoading(false);
        console.log("Finished fetching logs.");
      }
    };
    fetchLogs();
  }, [activeTab, currentPage]);

  // Filtered logs based on the search term
  const filteredLogs = logs.filter((log) => {
    const userFullName = userDetails[log.USER_ID] || "Unknown User";
    const logValues = [log.LOG_DATETIME, log.LOG_DESCRIPTION, userFullName]
      .join(" ")
      .toLowerCase();

    return logValues.includes(searchTerm.toLowerCase());
  });

  // Update headers and rows dynamically based on active tab
  const headers = ["Date & Time", "Description", "User"];

  const rows = filteredLogs.map((log) => [
    log.LOG_DATETIME,
    log.LOG_DESCRIPTION || "N/A",
    userDetails[log.USER_ID] || "Unknown User",
  ]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <Tabs>
            <StyledTabButton
              active={activeTab === "User Logs"}
              onClick={() => {
                setActiveTab("User Logs");
                setCurrentPage(1); // Reset to page 1 on tab change
              }}
            >
              User Logs
            </StyledTabButton>
            <StyledTabButton
              active={activeTab === "Transaction Logs"}
              onClick={() => {
                setActiveTab("Transaction Logs");
                setCurrentPage(1); // Reset to page 1 on tab change
              }}
            >
              Transaction Logs
            </StyledTabButton>
          </Tabs>
          <AnalyticsContainer>
            <Card
              label="Total Logs"
              value={totalRows} // Display the total count of logs
              bgColor={colors.primary}
              icon={<FaListAlt />}
            />
          </AnalyticsContainer>
          <Controls>
            <SearchBar
              placeholder={`Search / Filter ${activeTab.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Controls>
          {error ? (
            <p>{error}</p>
          ) : (
            <Table
              headers={headers}
              rows={rows}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              totalRows={totalRows}
              onPageChange={handlePageChange}
            />
          )}
        </div>
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

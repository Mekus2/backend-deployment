import React, { useState } from "react";
import styled from "styled-components";
import IssueDetailModal from "./IssueDetailModal";
import SearchBar from "../../Layout/SearchBar";
import Table from "../../Layout/Table";
import IssueData from "../../../data/IssueData"; // Import IssueData
import Button from "../../Layout/Button";

const SharedIssuesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const filteredIssues = IssueData
    .filter((issue) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        issue.ISSUE_TYPE.toLowerCase().includes(lowerCaseSearchTerm) || // Match Issue Type
        issue.RESOLUTION_STATUS.toLowerCase().includes(lowerCaseSearchTerm) // Match Resolution Status
      );
    })
    .sort((a, b) => new Date(b.REPORTED_DATE) - new Date(a.REPORTED_DATE)); // Sort by reported date descending

  const openDetailModal = (issue) => setSelectedIssue(issue);
  const closeDetailModal = () => setSelectedIssue(null);

  const handleCancelIssue = (issueId) => {
    console.log(`Issue with ID ${issueId} has been cancelled.`);
    setSelectedIssue(null);
  };

  // Updated headers to match Issue Type, Reported Date, Resolution Status, and Action
  const headers = ["Issue Type", "Reported Date", "Resolution Status", "Action"];
  const rows = filteredIssues.map((issue) => [
    issue.ISSUE_TYPE, // Issue Type
    issue.REPORTED_DATE, // Reported Date
    <Status status={issue.RESOLUTION_STATUS} key={issue.OUTBOUND_DEL_ID}>
      {issue.RESOLUTION_STATUS} {/* Displaying resolution status */}
    </Status>, // Resolution Status with styled component
    <Button bgColor="#00C4FF" onClick={() => openDetailModal(issue)}>
      Details
    </Button>, // Action Button (changed from "View" to "Details")
  ]);

  return (
    <>
      <Controls>
        <SearchBar
          placeholder="Search Issue Type or Resolution Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>
      <Table headers={headers} rows={rows} />
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={closeDetailModal}
          onCancelIssue={handleCancelIssue}
        />
      )}
    </>
  );
};

// Styled components
const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 1px;
`;

const Status = styled.span`
  background-color: ${(props) =>
    props.status === "Pending"
      ? "#f08400"
      : props.status === "Resolved"
      ? "#1DBA0B"
      : props.status === "Cancelled"
      ? "#FF4D4D"
      : "gray"};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
`;

export default SharedIssuesPage;

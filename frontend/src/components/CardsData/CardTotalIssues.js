import React from "react";
import Card from "../Layout/Card";
import ISSUES from "../../data/IssueData"; // Import IssueData
import styled from "styled-components";
import { FaExclamationTriangle } from "react-icons/fa";

const CardTotalIssues = () => {
    const issuesCount = ISSUES.length;
  
    return (
      <CardContainer>
        <Card
          label="Issues"
          value={issuesCount} // Display the total number of issues
          icon={<FaExclamationTriangle />} 
        />
      </CardContainer>
    );
  };
  
  const CardContainer = styled.div`
    cursor: pointer;
  `;
  
  export default CardTotalIssues;
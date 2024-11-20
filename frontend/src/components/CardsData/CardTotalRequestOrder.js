import React from "react";
import Card from "../Layout/Card"; // Import the reusable Card component
import { requests } from "../../data/RequestOrderData"; // Import the requests data
import styled from "styled-components";
import { FaClipboardCheck } from "react-icons/fa"; // Import an icon from react-icons

const CardTotalRequestOrder = () => {
  // Count the total number of requests
  const totalRequestsCount = requests.length; // Get the total count of all requests

  return (
    <CardContainer>
      <Card
        label="Request Orders" // Updated label to reflect total requests
        value={totalRequestsCount} // Display the total number of requests
        icon={<FaClipboardCheck />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalRequestOrder;

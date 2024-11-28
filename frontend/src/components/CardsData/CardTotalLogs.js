import React, { useState, useEffect } from "react"; // Ensure hooks are imported
import Card from "../Layout/Card"; // Import the reusable Card component
import styled from "styled-components";
import { FaClipboardList } from "react-icons/fa"; // Import an icon from react-icons
import { fetchTotalLogs } from "../../api/LogsApi"; // Ensure this API function exists and is correctly implemented

const CardTotalLogs = () => {
  const [totalLogs, setTotalLogs] = useState(null); // Set initial value to null
  const [loading, setLoading] = useState(true); // Loading state to manage API call state
  const [error, setError] = useState(null); // Error state to handle any issues with the API call

  useEffect(() => {
    const fetchTotalLogsData = async () => {
      try {
        const data = await fetchTotalLogs(); // Fetch data from API
        console.log("Fetched total logs:", data); // Log the fetched data
        setTotalLogs(data); // Set the total logs count to the state
      } catch (err) {
        setError("Failed to fetch total logs"); // Set error state if the API call fails
        console.error("Failed to fetch total logs:", err); // Log the error
      } finally {
        setLoading(false); // Always set loading to false after API call
      }
    };

    fetchTotalLogsData(); // Call the fetch function
  }, []); // Empty dependency array to run the effect only once when the component mounts

  // Show loading text while data is being fetched
  if (loading) {
    return (
      <CardContainer>
        <Card label="Logs" value="Loading..." icon={<FaClipboardList />} />
      </CardContainer>
    );
  }

  // Show error message if there was an error fetching the data
  if (error) {
    return (
      <CardContainer>
        <Card label="Logs" value={error} icon={<FaClipboardList />} />
      </CardContainer>
    );
  }

  // Display the fetched total logs count
  return (
    <CardContainer>
      <Card
        label="Logs"
        value={totalLogs} // Display the total number of logs
        icon={<FaClipboardList />} // Add the icon here
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalLogs;

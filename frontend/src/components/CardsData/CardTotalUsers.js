// src/components/CardsData/CardTotalUsers.js
import React, { useEffect, useState } from "react";
import { FaUserTie } from "react-icons/fa"; // Import an icon from react-icons
import Card from "../Layout/Card"; // Import the reusable Card component
import { fetchTotalStaff } from "../../api/StaffApi"; // Import the API call function
import styled from "styled-components";

const CardTotalUsers = () => {
  const [totalUsers, setTotalUsers] = useState(null); // Set initial value to null
  const [loading, setLoading] = useState(true); // Loading state to manage API call state
  const [error, setError] = useState(null); // Error state to handle any issues with the API call

  useEffect(() => {
    // Fetch total users count from the API
    const fetchTotalUsersData = async () => {
      try {
        const data = await fetchTotalStaff(); // Fetch data from API
        console.log("Fetched total users:", data); // Log the fetched data
        setTotalUsers(data); // Set the total users to the state
        setLoading(false); // Set loading state to false once data is fetched
      } catch (err) {
        setError("Failed to fetch total users"); // Set error state if the API call fails
        setLoading(false); // Set loading state to false even if there's an error
        console.error("Failed to fetch total users", err); // Log the error
      }
    };

    fetchTotalUsersData(); // Call the fetch function
  }, []); // Empty dependency array to run the effect only once when the component mounts

  // Show loading text while data is being fetched
  if (loading) {
    return (
      <CardContainer> 
        <Card label="STaff" value="Loading..." icon={<FaUserTie />} />
      </CardContainer>
    );
  }

  // Show error message if there was an error fetching the data
  if (error) {
    return (
      <CardContainer>
        <Card label="Staff" value={error} icon={<FaUserTie />} />
      </CardContainer>
    );
  }

  // Return the total users count if data is fetched successfully
  return (
    <CardContainer>
      <Card label="Staff" value={totalUsers} icon={<FaUserTie />} />
    </CardContainer>
  );
};

// Styled Components
const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalUsers;

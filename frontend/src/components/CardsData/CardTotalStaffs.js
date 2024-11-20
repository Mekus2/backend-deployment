// src/components/CardsData/CardTotalStaffs.js
import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa"; // Import an icon from react-icons
import Card from "../Layout/Card"; // Import the reusable Card component
import { fetchTotalStaff } from "../../api/StaffApi"; // Import the API call function
import styled from "styled-components";

const CardTotalStaffs = () => {
  const [totalStaff, setTotalStaff] = useState(null); // Set initial value to null
  const [loading, setLoading] = useState(true); // Loading state to manage API call state
  const [error, setError] = useState(null); // Error state to handle any issues with the API call

  useEffect(() => {
    // Fetch total staff count from the API
    const fetchTotalStaffs = async () => {
      try {
        const data = await fetchTotalStaff(); // Fetch data from API
        console.log("Fetched total staff:", data); // Log the fetched data
        setTotalStaff(data); // Set the total staff to the state
        setLoading(false); // Set loading state to false once data is fetched
      } catch (err) {
        setError("Failed to fetch total staff"); // Set error state if the API call fails
        setLoading(false); // Set loading state to false even if there's an error
        console.error("Failed to fetch total staff", err); // Log the error
      }
    };

    fetchTotalStaffs(); // Call the fetch function
  }, []); // Empty dependency array to run the effect only once when the component mounts

  // Show loading text while data is being fetched
  if (loading) {
    return (
      <CardContainer>
        <Card label="Staff" value="Loading..." icon={<FaUsers />} />
      </CardContainer>
    );
  }

  // Show error message if there was an error fetching the data
  if (error) {
    return (
      <CardContainer>
        <Card label="Staff" value={error} icon={<FaUsers />} />
      </CardContainer>
    );
  }

  // Return the total staff count if data is fetched successfully
  return (
    <CardContainer>
      <Card label="Staff" value={totalStaff} icon={<FaUsers />} />
    </CardContainer>
  );
};

// Styled Components
const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalStaffs;

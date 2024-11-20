import React, { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa"; // Import an icon from react-icons
import Card from "../Layout/Card"; // Import the reusable Card component
import { fetchTotalCustomer } from "../../api/CustomerApi"; // Import the API call function
import styled from "styled-components";

const CardTotalCustomers = () => {
  const [totalCustomers, setTotalCustomers] = useState(null); // Set initial value to null
  const [loading, setLoading] = useState(true); // Loading state to manage API call state
  const [error, setError] = useState(null); // Error state to handle any issues with the API call

  useEffect(() => {
    // Fetch total customers count from the API
    const fetchTotalCustomers = async () => {
      try {
        const data = await fetchTotalCustomer(); // Fetch data from API
        console.log('Fetched total customers:', data); // Log the fetched data
        setTotalCustomers(data); // Set the total customers to the state
        setLoading(false); // Set loading state to false once data is fetched
      } catch (err) {
        setError("Failed to fetch total customers"); // Set error state if the API call fails
        setLoading(false); // Set loading state to false even if there's an error
        console.error("Failed to fetch total customers", err); // Log the error
      }
    };

    fetchTotalCustomers(); // Call the fetch function
  }, []); // Empty dependency array to run the effect only once when the component mounts

  // Show loading text while data is being fetched
  if (loading) {
    return (
      <CardContainer>
        <Card label="Customers" value="Loading..." icon={<FaUsers />} />
      </CardContainer>
    );
  }

  // Show error message if there was an error fetching the data
  if (error) {
    return (
      <CardContainer>
        <Card label="Customers" value={error} icon={<FaUsers />} />
      </CardContainer>
    );
  }

  // Return the total customers count if data is fetched successfully
  return (
    <CardContainer>
      <Card label="Customers" value={totalCustomers} icon={<FaUsers />} />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalCustomers;

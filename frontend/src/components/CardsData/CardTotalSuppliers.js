import React, { useEffect, useState } from "react";
import { FaWarehouse } from "react-icons/fa"; // Import a relevant icon
import Card from "../Layout/Card"; // Import the reusable Card component
import { fetchTotalSupplier } from "../../api/SupplierApi"; // Import the API call function
import styled from "styled-components";

const CardTotalSuppliers = () => {
  const [totalSuppliers, setTotalSuppliers] = useState(null); // Set initial value to null
  const [loading, setLoading] = useState(true); // Loading state to manage API call state
  const [error, setError] = useState(null); // Error state to handle any issues with the API call

  useEffect(() => {
    // Fetch total suppliers count from the API
    const fetchTotalSuppliers = async () => {
      try {
        const data = await fetchTotalSupplier(); // Fetch data from API
        console.log("Fetched total suppliers:", data); // Log the fetched data
        setTotalSuppliers(data); // Set the total suppliers to the state
        setLoading(false); // Set loading state to false once data is fetched
      } catch (err) {
        setError("Failed to fetch total suppliers"); // Set error state if the API call fails
        setLoading(false); // Set loading state to false even if there's an error
        console.error("Failed to fetch total suppliers", err); // Log the error
      }
    };

    fetchTotalSuppliers(); // Call the fetch function
  }, []); // Empty dependency array to run the effect only once when the component mounts

  // Show loading text while data is being fetched
  if (loading) {
    return (
      <CardContainer>
        <Card label="Suppliers" value="Loading..." icon={<FaWarehouse />} />
      </CardContainer>
    );
  }

  // Show error message if there was an error fetching the data
  if (error) {
    return (
      <CardContainer>
        <Card label="Suppliers" value={error} icon={<FaWarehouse />} />
      </CardContainer>
    );
  }

  // Return the total suppliers count if data is fetched successfully
  return (
    <CardContainer>
      <Card label="Suppliers" value={totalSuppliers} icon={<FaWarehouse />} />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalSuppliers;

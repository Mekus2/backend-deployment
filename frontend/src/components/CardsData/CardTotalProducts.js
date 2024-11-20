import React, { useState, useEffect } from "react";
import { FaBox } from "react-icons/fa"; // Import an icon for products
import Card from "../Layout/Card"; // Import the reusable Card component
import { fetchTotalProduct } from "../../api/ProductApi"; // Import the fetchTotalProduct function
import styled from "styled-components";

const CardTotalProducts = () => {
  const [totalProducts, setTotalProducts] = useState(null); // State to store total products count

  useEffect(() => {
    // Fetch the total products count when the component mounts
    const getTotalProducts = async () => {
      try {
        const data = await fetchTotalProduct(); // Call the API to get total products
        console.log('total products:', data);
        setTotalProducts(data); // Update state with the total count
      } catch (error) {
        console.error("Failed to fetch total products:", error);
      }
    };

    getTotalProducts(); // Call the function on mount
  }, []); // Empty dependency array ensures it runs once when the component mounts

  return (
    <CardContainer>
      <Card
        label="Total Products"
        value={totalProducts !== null ? totalProducts : "Loading..."} // Display loading text while data is fetched
        icon={<FaBox />} // Add the products icon
      />
    </CardContainer>
  );
};

const CardContainer = styled.div`
  cursor: pointer;
`;

export default CardTotalProducts;

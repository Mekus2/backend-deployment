import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import CardTotalProducts from "../CardsData/CardTotalProducts";
import CardLowStocks from "../CardsData/CardLowStocks";
import InventoryDetailsModal from "../Inventory/InventoryDetailsModal";
import { getInventoryList } from "../../api/InventoryApi"; // Import the API function to get the inventory list
import Button from "../Layout/Button";
import axios from "axios";
const SharedInventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [inventoryData, setInventoryData] = useState([]); // State to store inventory data

  // Fetch inventory data when the component mounts
  useEffect(() => {
    const fetchInventory = async () => {
      const data = await getInventoryList();
      if (data) {
        setInventoryData(data); // Store the fetched inventory data
      }
    };
    fetchInventory();
  }, []);


  const filteredInventory = inventoryData.filter((item) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      item.PRODUCT_NAME.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.BATCH_ID.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.QUANTITY_ON_HAND.toString().includes(lowerCaseSearchTerm) ||
      item.PRODUCT_ID.PROD_IMAGE.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.EXPIRY_DATE.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  // Sort the filtered inventory by expiry date (ascending)

  const sortedInventory = [...filteredInventory].sort((a, b) =>
    new Date(a.EXPIRY_DATE) - new Date(b.EXPIRY_DATE)
  );

  const handleDetailClick = async (item) => {
    try {
      // Fetch the inventory details using the INVENTORY_ID
      const response = await axios.get(`http://127.0.0.1:8000/inventory/list/${item.INVENTORY_ID}/`);
      console.log("Fetched Inventory Details:", response.data);
      setSelectedItem(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching inventory details:", error);
    }
  };
  
  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const headers = [ "Name", "Batch No", "Quantity on Hand", "Expiry Date", "Action"];

  const rows = sortedInventory.map((item) => (
    [

      item.PRODUCT_NAME,
      item.BATCH_ID,
      item.QUANTITY_ON_HAND,
      item.EXPIRY_DATE, // Added expiry date
      <Button onClick={() => handleDetailClick(item)}>Details</Button>,
    ]
  ));

  return (
    <>
      <AnalyticsContainer>
        <CardTotalProducts />
        <CardLowStocks />
      </AnalyticsContainer>
      <Controls>
        <SearchBar
          placeholder="Search / Filter inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Controls>
      <Table headers={headers} rows={rows} />
      {showDetailModal && selectedItem && (
        <InventoryDetailsModal item={selectedItem} onClose={closeModal} />
      )}
    </>
  );
};

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
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

// Styled component for centering the image
const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px; // Ensure the height matches the image height
`;

export default SharedInventoryPage;

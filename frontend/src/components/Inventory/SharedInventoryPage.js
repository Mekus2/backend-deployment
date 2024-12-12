import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import CardTotalProducts from "../CardsData/CardTotalProducts";
import CardLowStocks from "../CardsData/CardLowStocks";
import InventoryDetailsModal from "../Inventory/InventoryDetailsModal";
import axios from "axios";
import Button from "../Layout/Button";

const SharedInventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventoryData, setInventoryData] = useState([]); // State to store inventory data
  const [loading, setLoading] = useState(false); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors

  // Fetch inventory data when the search term changes
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true); // Start loading
      setError(null); // Reset error state
      try {
        const url = searchTerm
          ? `http://127.0.0.1:8000/inventory/search/?PRODUCT_NAME=${searchTerm}`
          : `http://127.0.0.1:8000/inventory/list/`;
        const response = await axios.get(url);
        setInventoryData(response.data); // Store the fetched inventory data
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Inventory data not found.");
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchInventory();
  }, [searchTerm]); // Re-run whenever the search term changes

  const handleDetailClick = async (item) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/inventory/list/${item.INVENTORY_ID}/`
      );
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

  const headers = ["Name", "Batch No", "Quantity on Hand", "Expiry Date", "Action"];

  const rows = inventoryData.map((item) => [
    item.PRODUCT_NAME,
    item.BATCH_ID,
    item.QUANTITY_ON_HAND,
    item.EXPIRY_DATE,
    <Button onClick={() => handleDetailClick(item)}>Details</Button>,
  ]);

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
      {loading ? (
        <p>Loading inventory...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Table headers={headers} rows={rows} />
      )}
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

export default SharedInventoryPage;

import React, { useState } from "react";
import styled from "styled-components";
import SearchBar from "../Layout/SearchBar";
import Table from "../Layout/Table";
import CardTotalProducts from "../CardsData/CardTotalProducts";
import CardLowStocks from "../CardsData/CardLowStocks";
import InventoryDetailsModal from "../Inventory/InventoryDetailsModal";
import productData from "../../data/ProductData"; // Ensure the path is correct
import Button from "../Layout/Button";

const SharedInventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredInventory = productData.PRODUCT_INVENTORY.filter((item) => {
    const product = productData.PRODUCT.find((p) => p.PROD_ID === item.PROD_ID);
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      product.PROD_NAME.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.PROD_INV_BATCH_NO.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.PROD_INV_QTY_ON_HAND.toString().includes(lowerCaseSearchTerm) ||
      product.PROD_IMAGE.toLowerCase().includes(lowerCaseSearchTerm) || // Include image search
      item.PROD_INV_EXP_DATE.toLowerCase().includes(lowerCaseSearchTerm) // Include expiry date search
    );
  });

  // Sort the filtered inventory by expiry date (ascending)
  const sortedInventory = [...filteredInventory].sort(
    (a, b) => new Date(a.PROD_INV_EXP_DATE) - new Date(b.PROD_INV_EXP_DATE)
  );

  const handleDetailClick = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const headers = [
    "Image",
    "Name",
    "Batch No",
    "Quantity on Hand",
    "Expiry Date",
    "Action",
  ];

  const rows = sortedInventory.map((item) => {
    const product = productData.PRODUCT.find((p) => p.PROD_ID === item.PROD_ID);
    return [
      <ImageContainer>
        <img
          src={product.PROD_IMAGE}
          alt={product.PROD_NAME}
          width="50"
          height="50"
        />
      </ImageContainer>,
      product.PROD_NAME,
      item.PROD_INV_BATCH_NO,
      item.PROD_INV_QTY_ON_HAND,
      item.PROD_INV_EXP_DATE, // Added expiry date
      <Button onClick={() => handleDetailClick(item)}>Details</Button>,
    ];
  });

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

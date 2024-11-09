// src/components/Category/CategoryAddProduct.js

import React, { useState } from "react";
import styled from "styled-components";
import Modal from "../../Layout/Modal"; // Reusable Modal component
import SearchBar from "../../Layout/SearchBar"; // Reusable SearchBar component
import Button from "../../Layout/Button"; // Import the Button component
import { colors } from "../../../colors"; // Ensure you import colors from the correct path

const CategoryAddProduct = ({ availableProducts, onAddProduct, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter available products based on the search term
  const filteredProducts = availableProducts.filter(product =>
    product.PROD_NAME.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product) => {
    onAddProduct(product); // Call the provided add product function
  };

  return (
    <Modal title="Add Product" onClose={onClose}>
      <SearchBarContainer>
        <SearchBar
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBarContainer>
      <ProductTable>
        <thead>
          <tr>
            <TableHeader>Product Name</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <TableRow key={product.PROD_ID}>
                <TableCell>{product.PROD_NAME}</TableCell>
                <TableCell>
                  <Button onClick={() => handleAddProduct(product)}>Add</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>No products found.</TableCell>
            </TableRow>
          )}
        </tbody>
      </ProductTable>
    </Modal>
  );
};

// Styled components
const SearchBarContainer = styled.div`
  margin-bottom: 15px;
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
`;

const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: center;
`;

export default CategoryAddProduct;

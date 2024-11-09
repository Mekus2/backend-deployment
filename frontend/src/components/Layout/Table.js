import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../../colors";

const Table = ({ headers, rows, rowsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  // Get rows for the current page
  const currentRows = rows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Pagination Handlers
  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  return (
    <TableWrapper>
      <TableContainer>
        <StyledTable>
          <thead>
            <TableRow>
              {headers.map((header, index) => (
                <TableHeader key={index}>{header}</TableHeader>
              ))}
            </TableRow>
          </thead>
          <tbody>
            {currentRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>

      {/* Pagination Controls */}
      <Pagination>
        <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <PageInfo>
          Page {currentPage} of {totalPages}
        </PageInfo>
        <Button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </Pagination>
    </TableWrapper>
  );
};

// Styled Components
const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin: 0 auto;
`;

const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  border: 1px solid #ddd;
  font-size: 17px;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  font-size: 13px;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
`;

const Button = styled.button`
  background-color: ${colors.primary};
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 5px;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  margin: 0 10px;
`;

export default Table;

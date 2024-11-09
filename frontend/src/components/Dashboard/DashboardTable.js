import React from "react";
import styled from "styled-components";
import { colors } from "../../colors";

const DashboardTable = ({ title, headers, data }) => {
  return (
    <TableWrapper>
      <Title>{title}</Title> {/* Use styled component for title */}
      <Table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  margin-bottom: 10px;
  padding: 1rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  text-align: center;
  flex: 1;
  min-width: 45%; /* Ensures the table occupies about half of the row */
`;

const Title = styled.h3`
  font-weight: bold; /* Make the title bold */
  font-size: 15px;
  padding-bottom: 10px; /* Optional: add some space below the title */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  table-layout: auto; /* Allows columns to adjust based on content */

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: ${colors.primary};
    color: white;
  }
`;

export default DashboardTable;

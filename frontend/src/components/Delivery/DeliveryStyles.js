// DeliveryStyles.js
import styled from "styled-components";
import { colors } from "../../colors";

export const InvoiceButton = styled.button`
  background-color: ${colors.primary}; /* Green color */
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-right: 10px;

  &:hover {
    background-color: ${colors.primaryHover};
  }
`;

export const ErrorContainer = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: ${colors.error};
`;

export const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const Column = styled.div`
  width: 48%;
`;

export const FormGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

export const Label = styled.div`
  font-weight: bold;
  color: black;
`;

export const Value = styled.div`
  color: ${colors.text};
`;

export const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-top: 15px;
  margin-bottom: 20px;
`;

export const TableHeader = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 10px;
  text-align: center;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

export const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ddd;
`;

export const TotalSummary = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 20px;
  font-weight: bold;
`;

export const SummaryItem = styled.div`
  margin-top: 10px;
`;

export const HighlightedTotal = styled.span`
  color: green;
  font-size: 16px;
`;

export const ProgressSection = styled.div`
  margin-top: 20px;
  text-align: center;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin: 10px 0;
`;

export const ProgressFiller = styled.div`
  height: 100%;
  width: ${(props) => props.progress}%;
  background-color: ${colors.primary};
  border-radius: 10px;
  transition: width 0.5s ease;
`;

export const ProgressText = styled.div`
  font-size: 1.1em;
  font-weight: bold;
  color: ${colors.primary};
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

export const StatusButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-left: 10px;

  &:hover {
    background-color: ${colors.primaryHover};
  }
`;

export const IssueButton = styled.button`
  color: Gray;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 5px;
  margin-right: 10px;

  &:hover {
    color: black;
  }
`;
// Modal Wrapper for the background and center alignment
export const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it's on top of other content */
`;

// Modal content area
export const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  width: 80%;
  max-width: 600px;
  border-radius: 10px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// Close button for the modal
export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  color: #888;
  cursor: pointer;
  &:hover {
    color: #000;
  }
`;
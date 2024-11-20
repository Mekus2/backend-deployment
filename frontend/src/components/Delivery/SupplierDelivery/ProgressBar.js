//ProgressBar.js
import React from "react";
import { ProgressSection, ProgressBar, ProgressFiller, ProgressText, ModalFooter, StatusButton } from './SupplierDeliveryStyles'; // Adjust the import path as needed

const ProgressBar = ({ status, onStatusChange, handleMarkAsReceivedClick }) => {
  // Function to get the progress percentage based on status
  const getProgressPercentage = () => {
    switch (status) {
      case "Awaiting":
        return 33; // 33% progress for Awaiting
      case "In Transit":
        return 66; // 66% progress for In Transit
      case "Received":
        return 100; // 100% progress for Received
      default:
        return 0;
    }
  };

  return (
    <div>
      {/* Progress Bar */}
      <ProgressSection>
        <ProgressBar>
          <ProgressFiller progress={getProgressPercentage()} />
        </ProgressBar>
        <ProgressText>{getProgressPercentage()}%</ProgressText>
      </ProgressSection>

      {/* Status Change Buttons */}
      <ModalFooter>
        {status === "Awaiting" && (
          <StatusButton onClick={() => onStatusChange("In Transit")}>
            Mark as In Transit
          </StatusButton>
        )}
        {status === "In Transit" && (
          <StatusButton onClick={handleMarkAsReceivedClick}>
            Mark as Received
          </StatusButton>
        )}
        {status === "Received" && (
          <StatusButton onClick={() => onStatusChange("Awaiting")}>
            Mark as Awaiting
          </StatusButton>
        )}
      </ModalFooter>
    </div>
  );
};

export default ProgressBar;

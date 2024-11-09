import React from "react";
import { saveLayout } from "./indexedDB";

const ResetLayout = ({ setCurrentCardOrder, setTableOrder }) => {
  const handleResetLayout = async () => {
    // Reset card layout to default state with all required cards
    const defaultCardOrder = [
      "CardTotalInventoryValue",
      "CardTotalSales",
      "CardTotalRequestOrder",
      "CardTotalSupplierOrder",
      "CardTotalCustomerOrder",
      "CardTotalSuppliers",
      "CardTotalUsers",
      "CardTotalTransactions",
      "CardTotalProducts",
      "CardTotalCategories",
      "CardLowStocks",
      "CardTotalCustomers",
      "CardTotalDelivery",
      "CardTotalReturns",
      "CardTotalLogs",
      "CardTotalNotification",
    ];

    // Reset table layout to default state
    const defaultTableOrder = [
      "LowestStocks",
      "ExpiredItemsAlert",
      "HighestSellingProducts",
      "RecentlyAddedProducts",
      // Add any other tables you want to reset
    ];

    // Update the state with the default layout
    setCurrentCardOrder(defaultCardOrder);
    setTableOrder(defaultTableOrder);

    // Clear the layout saved in indexedDB
    await saveLayout("superadmin", "cardOrder", defaultCardOrder);
    await saveLayout("superadmin", "tableOrder", defaultTableOrder);
  };

  return <button onClick={handleResetLayout}>Reset Layout</button>;
};

export default ResetLayout;

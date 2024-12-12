import React, { useState, useEffect } from "react";
import ReportBody from "./ReportBody";
import generatePDF from "./GeneratePdf";
import generateExcel from "./GenerateExcel";
import PreviewModal from "./PreviewModal";

const CustomerOrderReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [excelData, setExcelData] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!startDate || !endDate) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/delivery/customer/dateRange/?start_date=${startDate}&end_date=${endDate}`
        );
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error("Failed to fetch orders data");
        }
      } catch (error) {
        console.error("Error fetching orders data:", error);
      }
    };

    fetchOrders();
  }, [startDate, endDate]);

  // Filters for search term to match customer name, status, city, etc.
  const matchesSearchTerm = (order) => {
    const searchStr = searchTerm.toLowerCase();
    
    const customerName = order.OUTBOUND_DEL_CUSTOMER_NAME || '';  // Default to an empty string if undefined
    const status = order.OUTBOUND_DEL_STATUS || '';  // Default to an empty string if undefined
    const city = order.OUTBOUND_DEL_CITY || '';  // Default to an empty string if undefined
    const province = order.OUTBOUND_DEL_PROVINCE || '';  // Default to an empty string if undefined
  
    return (
      customerName.toLowerCase().includes(searchStr) ||
      status.toLowerCase().includes(searchStr) ||
      city.toLowerCase().includes(searchStr) ||
      province.toLowerCase().includes(searchStr)
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter orders based on date range and search term
  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const matchesDateRange =
          (!startDate ||
            new Date(order.OUTBOUND_DEL_CREATED) >= new Date(startDate)) &&
          (!endDate ||
            new Date(order.OUTBOUND_DEL_CREATED) <= new Date(endDate));
        return matchesSearchTerm(order) && matchesDateRange;
      }).sort(
        (a, b) =>
          new Date(b.OUTBOUND_DEL_CREATED) - new Date(a.OUTBOUND_DEL_CREATED)
      )
    : [];

  // Group orders by customer
  const groupByCustomer = (orders) => {
    return orders.reduce((acc, order) => {
      const customerName = order.OUTBOUND_DEL_CUSTOMER_NAME;
      if (!acc[customerName]) {
        acc[customerName] = {
          totalPrice: 0,
          orderCount: 0,
          status: order.OUTBOUND_DEL_STATUS,
          orders: [],
        };
      }
      acc[customerName].totalPrice += parseFloat(order.OUTBOUND_DEL_TOTAL_PRICE || 0);
      acc[customerName].orderCount += 1;
      acc[customerName].orders.push(order);
      return acc;
    }, {});
  };

  // Get grouped customer data
  const groupedCustomerData = groupByCustomer(filteredOrders);

  const header = ["Customer", "Order Date", "Total Price", "Status"];

  // Table data for customers
  const tableData = filteredOrders.map((order) => {
    const grossProfit =
      parseFloat(order.INBOUND_DEL_TOTAL_PRICE) - parseFloat(order.OUTBOUND_DEL_TOTAL_RCVD_QTY);
    return [
      order.OUTBOUND_DEL_CUSTOMER_NAME, // Supplier
      formatDate(order.OUTBOUND_DEL_CREATED), // Order Date, formatted to show only date
      `₱${parseFloat(order.OUTBOUND_DEL_TOTAL_PRICE).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`, // Total Price
      order.OUTBOUND_DEL_STATUS, // Status
    ];
  });

  const totalOrders = filteredOrders.length;

  // Aggregate total price for all orders in the report
  const totalOrderValue = filteredOrders.reduce(
    (acc, order) => acc + parseFloat(order.OUTBOUND_DEL_TOTAL_PRICE || 0),
    0
  );

  const handlePreviewPDF = () => {
    const pdfData = generatePDF(
      header,
      tableData,
      totalOrders,
      totalOrderValue
    );
    setPdfContent(pdfData);
    setExcelData(null);
    setIsModalOpen(true);
  };

  const handlePreviewExcel = () => {
    setExcelData({
      header,
      rows: tableData,
      totalOrders,
      totalAmount: totalOrderValue,
    });
    setPdfContent("");
    setIsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfContent;
    link.download = "customer_order_report.pdf";
    link.click();
    setIsModalOpen(false);
  };

  const handleDownloadExcel = async () => {
    try {
      const excelBlobData = await generateExcel(
        header,
        tableData,
        totalOrders,
        totalOrderValue
      );
      const url = URL.createObjectURL(excelBlobData);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customer_order_report.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  return (
    <>
      <ReportBody
        title="Customer Order Report"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        headers={header}
        rows={tableData}
        totalOrders={totalOrders}
        totalOrderValue={totalOrderValue}
        onDownloadPDF={handlePreviewPDF}
        onPreviewExcel={handlePreviewExcel}
      />

      <PreviewModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        pdfContent={pdfContent}
        excelData={excelData}
        onDownloadPDF={handleDownloadPDF}
        onDownloadExcel={handleDownloadExcel}
      />
    </>
  );
};

export default CustomerOrderReport;

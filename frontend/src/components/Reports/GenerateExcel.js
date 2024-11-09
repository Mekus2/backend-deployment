import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // Ensure you have file-saver for Excel download

// Excel Generation
const generateExcel = async (header, data, totalOrders, totalValue) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Supplier Report");

  // Add header row
  worksheet.addRow(header).font = { bold: true };

  // Center the text for all header cells
  header.forEach((_, index) => {
    worksheet.getColumn(index + 1).alignment = { horizontal: "center" };
  });

  // Add data rows and center the text in cells
  data.forEach((row) => {
    const newRow = worksheet.addRow(row);
    newRow.eachCell((cell) => {
      cell.alignment = { horizontal: "center" }; // Center text in data cells
    });
  });

  // Add summary rows
  const totalOrdersRow = worksheet.addRow(["Total Orders", totalOrders]);
  totalOrdersRow.getCell(1).font = { bold: true }; // Make "Total Orders" bold

  const totalAmountRow = worksheet.addRow(["Total Amount", `₱${totalValue}`]);
  totalAmountRow.getCell(1).font = { bold: true }; // Make "Total Amount" bold

  // Center all the text in the summary cells
  totalOrdersRow.eachCell((cell) => {
    cell.alignment = { horizontal: "center" };
  });
  totalAmountRow.eachCell((cell) => {
    cell.alignment = { horizontal: "center" };
  });

  // Set the column widths based on header length
  header.forEach((col, index) => {
    worksheet.getColumn(index + 1).width = col.length + 5; // Adjust width as needed
  });

  // Generate the Excel file and return the Blob for download
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "purchase_report.xlsx"); // Download the Excel file
  } catch (error) {
    console.error("Error generating Excel file:", error); // Log any errors
    alert("There was an error generating the Excel file. Please try again."); // Inform the user
  }
};

export default generateExcel;

import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { logoBase64 } from "../../data/imageData"; // Import your base64 logo

// PDF Generation
const generatePDF = (
  header,
  data,
  totalOrders,
  totalSales,
  totalExpenses,
  netProfit,
  companyName = "PHILVETS",
  companyDetails = "123-456-789"
) => {
  const doc = new jsPDF();

  // Use UTF-8 encoding to ensure peso sign renders correctly
  doc.setFont("helvetica", "normal", "utf-8");

  // Add the company logo at the upper left corner with aspect ratio locked
  const logoWidth = 12; // Width for the logo
  const logoHeight = logoWidth; // Height set to maintain 1:1 aspect ratio
  const logoX = 12; // Margin Left
  const logoY = 5; // Margin Top
  doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight); // Adds the logo at upper left

  // Center the company name closer to the top
  const pageWidth = doc.internal.pageSize.width;

  // Set plain styling for the company name and center it
  doc.setFontSize(16); // Slightly smaller font size for better alignment
  doc.setFont("helvetica", "bold");
  doc.text(companyName, pageWidth / 2, logoY + logoHeight + 8, {
    align: "center",
  });

  // Company number (move closer to the company name)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(companyDetails, pageWidth / 2, logoY + logoHeight + 14, {
    align: "center",
  });

  // Report title (aligned to the left, adjust position to reduce space)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Daily Stock Report", 14, logoY + logoHeight + 24);

  // Date (below report title, left-aligned)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Date: ${new Date().toLocaleDateString()}`,
    14,
    logoY + logoHeight + 30
  );

  // Prepare data for the table
  const pdfData = data.map((row) => {
    return row.map((cell, index) => {
      if (index === 3) {
        // Assuming order amount is in the last column
        const amount = parseFloat(cell.replace(/₱|,/g, "").trim());
        return isNaN(amount) ? cell : amount; // Convert to number
      }
      return cell; // Return other values unchanged
    });
  });

  // Table
  doc.autoTable({
    head: [header],
    body: pdfData,
    startY: logoY + logoHeight + 36, // Adjust start position based on where the date ends
    styles: {
      cellPadding: 3,
      fontSize: 9,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [0, 196, 255],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
  });

  // Summary (after the table)
  const summaryY = doc.autoTable.previous.finalY + 10;
  doc.setFont("helvetica", "bold");

  // Function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Total Orders
  doc.text(`Total Orders:`, 14, summaryY);
  doc.setFont("helvetica", "italic").setFont("helvetica", "bold"); // Set italic and bold for the value
  doc.text(formatNumber(totalOrders), 100, summaryY, { align: "right" }); // Adjust x to align right

  // Sales
  doc.setFont("helvetica", "bold"); // Reset font to bold for the label
  doc.text(`Revenue:`, 14, summaryY + 6);
  doc.setFont("helvetica", "italic").setFont("helvetica", "bold"); // Set italic and bold for the value
  doc.text(`${formatNumber(totalSales.toFixed(2))}`, 100, summaryY + 6, {
    align: "right",
  });

  // Expenses
  doc.setFont("helvetica", "bold"); // Reset font to bold for the label
  doc.text(`Cost:`, 14, summaryY + 12);
  doc.setFont("helvetica", "italic").setFont("helvetica", "bold"); // Set italic and bold for the value
  doc.text(`${formatNumber(totalExpenses.toFixed(2))}`, 100, summaryY + 12, {
    align: "right",
  });

  // Gross Profit
  doc.setFont("helvetica", "bold"); // Reset font to bold for the label
  doc.text(`Gross Profit:`, 14, summaryY + 18);
  doc.setFont("helvetica", "italic").setFont("helvetica", "bold"); // Set italic and bold for the value
  doc.text(`${formatNumber(netProfit.toFixed(2))}`, 100, summaryY + 18, {
    align: "right",
  });

  // Convert to base64 string for preview or download
  return doc.output("datauristring");
};

const generateExcel = async (
  header,
  data,
  totalOrders,
  totalSales,
  totalExpenses,
  netProfit
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("All Order Report");

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

  // Add 1-cell gap before summary rows
  worksheet.addRow([]); // Empty row for gap

  // Function to format currency values with commas
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Adds commas for thousands
  };

  // Add summary rows starting from column B (labels) and column C (values)
  worksheet.addRow(["", "Total Orders:"]).getCell(2).font = { bold: true }; // Column B for Total Orders label
  worksheet.getCell("C" + worksheet.lastRow.number).font = {
    bold: true,
    italic: true,
  }; // Bold and italic for the value
  worksheet.getCell("C" + worksheet.lastRow.number).value = totalOrders; // No peso sign for Total Orders

  worksheet.addRow(["", "Revenue:"]).getCell(2).font = { bold: true }; // Column B for Sales label
  worksheet.getCell("C" + worksheet.lastRow.number).font = {
    bold: true,
    italic: true,
  }; // Bold and italic for the value
  worksheet.getCell("C" + worksheet.lastRow.number).value = `₱${formatCurrency(
    totalSales
  )}`; // Format with peso sign and commas

  worksheet.addRow(["", "Cost:"]).getCell(2).font = { bold: true }; // Column B for Expenses label
  worksheet.getCell("C" + worksheet.lastRow.number).font = {
    bold: true,
    italic: true,
  }; // Bold and italic for the value
  worksheet.getCell("C" + worksheet.lastRow.number).value = `₱${formatCurrency(
    totalExpenses
  )}`; // Format with peso sign and commas

  worksheet.addRow(["", "Gross Profit:"]).getCell(2).font = { bold: true }; // Column B for Gross Profit label
  worksheet.getCell("C" + worksheet.lastRow.number).font = {
    bold: true,
    italic: true,
  }; // Bold and italic for the value
  worksheet.getCell("C" + worksheet.lastRow.number).value = `₱${formatCurrency(
    netProfit
  )}`; // Format with peso sign and commas

  // Center all the text in the summary cells
  worksheet.lastRow.eachCell((cell, index) => {
    if (index === 1) {
      cell.alignment = { horizontal: "left" }; // Align the labels to the left
    } else {
      cell.alignment = { horizontal: "center" }; // Center the values
    }
  });

  // Automatically adjust the widths of all columns based on their content
  header.forEach((_, index) => {
    const column = worksheet.getColumn(index + 1);
    const maxLength = Math.max(
      ...data.map((row) => (row[index] ? row[index].toString().length : 0)), // Length of data
      header[index].length // Length of header
    );

    // Add some padding for better visual spacing
    column.width = Math.max(maxLength + 2, 10); // Minimum width to avoid too narrow columns
    column.alignment = { horizontal: "center" }; // Center all content in the column
  });

  // Add a specific width adjustment for summary columns
  worksheet.getColumn(2).width = Math.max(worksheet.getColumn(2).width, 20); // Ensure column B is wide enough for labels
  worksheet.getColumn(3).width = Math.max(worksheet.getColumn(3).width, 20); // Ensure column C is wide enough for values

  // Generate the Excel file and return the Blob for download
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return blob; // Return the blob for preview instead of saving
  } catch (error) {
    console.error("Error generating Excel file:", error); // Log any errors
    throw new Error(
      "There was an error generating the Excel file. Please try again."
    ); // Inform the user
  }
};

// Exporting both functions
export { generatePDF, generateExcel };

// PieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ totalSales, totalExpenses, netProfit }) => {
  const data = {
    labels: ["Sales", "Expenses", "Profit"],
    datasets: [
      {
        label: "Amount (₱)",
        data: [totalSales, totalExpenses, netProfit],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the pie chart to fill the height
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div style={{ height: "200px", width: "300px" }}>
      {" "}
      {/* Set a fixed height and width for the container */}
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;

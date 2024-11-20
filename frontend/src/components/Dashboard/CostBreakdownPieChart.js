import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import styled from "styled-components";

const pieData = [
  { name: "Profit", value: 107000 },
  { name: "Expense", value: 50000 },
  { name: "Revenue", value: 620000 },
];

const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

const CostBreakdownPieChart = () => {
  return (
    <GraphCard>
      <GraphTitle>Cost Breakdown</GraphTitle>
      <ChartContainer>
        <PieChart width={300} height={300}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ChartContainer>
      <LegendContainer>
        <LegendContent>
          <LegendItem color={COLORS[0]}>Profit</LegendItem>
          <LegendItem color={COLORS[1]}>Expense</LegendItem>
          <LegendItem color={COLORS[2]}>Revenue</LegendItem>
        </LegendContent>
      </LegendContainer>
    </GraphCard>
  );
};

const GraphCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 30%;
  height: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 250px;
`;

const GraphTitle = styled.h3`
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 10px;
`;

const ChartContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const LegendContent = styled.div`
  display: flex;
  align-items: center;
`;

const LegendItem = styled.div`
  font-size: 0.8rem;
  font-weight: 400;
  margin: 0 10px;
  display: flex;
  align-items: center;

  &::before {
    content: "";
    display: inline-block;
    width: 12px;
    height: 12px;
    background-color: ${(props) => props.color};
    margin-right: 5px;
  }
`;

export default CostBreakdownPieChart;


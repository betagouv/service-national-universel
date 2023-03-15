import React from "react";

import { Doughnut } from "react-chartjs-2";
// eslint-disable-next-line import/namespace
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import DashboardContainer from "../../components/DashboardContainer";

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ["Occupées", "Disponibles"],
  title: "Salles de réunion",
  datasets: [
    {
      label: "# of Votes",
      data: [12, 19],
      backgroundColor: ["#1E40AF", "#3B82F6"],
      borderWidth: 0,
      with: 0,
      height: 0,
      padding: 0,
    },
  ],
};

export default function Index() {
  return (
    <DashboardContainer active="general">
      <div className="w-[400px] bg-white mt-8">
        <Doughnut
          data={data}
          options={{
            rotation: -90,
            circumference: 180,
            cutout: "80%",
            plugins: {
              title: {
                display: true,
                text: "Custom Chart Title",
                padding: {
                  top: 10,
                  bottom: 30,
                },
              },
              legend: {
                display: true,
                labels: {
                  usePointStyle: true,
                  position: "bottom",
                },
              },
            },
          }}
        />
      </div>
    </DashboardContainer>
  );
}

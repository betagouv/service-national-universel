import React from "react";
import { ScatterPlot } from "@nivo/scatterplot";

interface PlotProps {
  xLabel: string;
  yLabel: string;
  min?: number | "auto";
  max?: number | "auto";
  width?: number;
  height?: number;
  selected?: number;
  points: { x: number; y: number }[];
}

export const Plot = ({
  xLabel,
  yLabel,
  min = "auto",
  max = "auto",
  width = 900,
  height = 500,
  selected,
  points = [],
}: PlotProps) => {
  return (
    <ScatterPlot
      width={width}
      height={height}
      margin={{ top: 24, right: 24, bottom: 80, left: 80 }}
      nodeSize={10}
      data={[
        {
          id: xLabel,
          data: points,
        },
        {
          id: "selected",
          data: selected
            ? [
                {
                  x: points.findIndex((point) => point.y === selected),
                  y: selected,
                },
              ]
            : [],
        },
      ]}
      tooltip={({ node }) => <strong>{node.data.y as any}</strong>}
      yScale={{
        type: "linear",
        min,
        max,
      }}
      colors={["navy", "red"]}
      axisLeft={{
        legend: yLabel,
        legendPosition: "middle",
        legendOffset: -60,
      }}
      axisBottom={{
        legend: xLabel,
        legendPosition: "middle",
        legendOffset: 60,
      }}
      animate={false}
    />
  );
};

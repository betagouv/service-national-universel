import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";

import { graphColors, Legends } from "./graph-commons";

const centerPlugin = {
  id: "centerPlugin",
  beforeDraw(chart, args, options) {
    if (options.centerColor) {
      const { ctx } = chart;
      const radius = chart._metasets[0].controller.innerRadius;
      const x = chart.getDatasetMeta(0).data[0].x;
      const y = chart.getDatasetMeta(0).data[0].y;
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = options.centerColor;
      ctx.fill();
    }
  },
};
ChartJS.register(centerPlugin);

export default function DemiDoughnut({ title, values, labels, className = "" }) {
  const [graphOptions, setGraphOptions] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (values) {
      const dataColors = graphColors[values.length];

      setTotal(values.reduce((value, previousValue) => value + previousValue, 0));

      setGraphOptions({
        rotation: -90,
        circumference: 180,
        cutout: "65%",
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
          },
          centerPlugin: {
            centerColor: "#EFF6FF",
          },
        },
      });
      setGraphData({
        labels,
        title,
        datasets: [
          {
            data: values,
            backgroundColor: dataColors,
            borderWidth: 0,
            with: 0,
            height: 0,
            padding: 0,
          },
        ],
      });
    } else {
      setGraphData(null);
      setGraphOptions(null);
      setTotal(0);
    }
  }, [values]);

  return (
    <div className={className}>
      <div className="text-left text-gray-900 text-sm font-bold w-full">{title}</div>
      <Legends labels={labels} values={values} className="w-full my-8" />
      <div className="relative">
        {graphData && <Doughnut data={graphData} options={graphOptions} />}
        <div className="flex flex-col absolute left-[0px] right-[0px] bottom-[14px]">
          <div className="text-xs text-gray-600 text-center">Total</div>
          <div className="text-2xl text-gray-900 font-bold text-center">{total}</div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js";

import { getGraphColors, Legends } from "./graph-commons";
import GraphTooltip from "./GraphTooltip";

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

export default function DemiDoughnut({ title, values, labels, tooltips, tooltipsPercent = false, legendUrls, className = "", onLegendClicked = () => {} }) {
  const [graphOptions, setGraphOptions] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [total, setTotal] = useState(0);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (values) {
      const dataColors = getGraphColors(values.length);

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
          tooltip: {
            enabled: false,
          },
        },
        onHover: function (evt, elems) {
          if ((tooltips || tooltipsPercent) && elems.length > 0) {
            if (tooltipsPercent || tooltips.length > elems[0].index) {
              const angle = elems[0].element.startAngle + (elems[0].element.endAngle - elems[0].element.startAngle) / 2;
              const x = Math.cos(angle) * (elems[0].element.outerRadius - 10);
              const y = Math.sin(angle) * (elems[0].element.outerRadius - 10);
              const left = x >= 0 ? " + " + Math.round(x) : " - " + Math.round(-x);
              const bottom = Math.round(17 - y);

              let value;
              if (tooltipsPercent) {
                value = total ? Math.round((values[elems[0].index] / total) * 100) + "%" : "-";
              } else {
                value = tooltips[elems[0].index];
              }

              setTooltip({
                style: {
                  left: "calc(50%" + left + "px)",
                  bottom: bottom + "px",
                  transition: "all ease-in-out .2s",
                  display: "block",
                },
                value,
              });
            } else {
              setTooltip(null);
            }
          } else {
            setTooltip(null);
          }
        },
      });
      setGraphData({
        labels,
        title,
        datasets: [
          {
            data: values,
            backgroundColor: dataColors,
            hoverBackgroundColor: dataColors,
            hoverBorderWidth: 3,
            hoverBorderColor: dataColors,
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

  function clickOnLegend({ index, label, value, color }) {
    if (legendUrls && legendUrls[index]) {
      window.open(legendUrls[index], "_blank");
    } else {
      onLegendClicked(index, label, value, color);
    }
  }

  return (
    <div className={className}>
      <div className="w-full text-left text-sm font-bold text-gray-900">{title}</div>
      <Legends labels={labels} values={values} className="my-8 w-full" onLegendClicked={clickOnLegend} />
      <div className="relative">
        {graphData && <Doughnut data={graphData} options={graphOptions} />}
        <div className="pointer-events-none absolute left-[0px] right-[0px] bottom-[14px] flex flex-col">
          <div className="text-center text-xs text-gray-600">Total</div>
          <div className="text-center text-2xl font-bold text-gray-900">{total}</div>
        </div>
        {tooltip && <GraphTooltip style={tooltip.style}>{tooltip.value}</GraphTooltip>}
      </div>
    </div>
  );
}

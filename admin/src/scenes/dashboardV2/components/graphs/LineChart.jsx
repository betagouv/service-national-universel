import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import GraphTooltip from "./GraphTooltip";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function LineChart({ dataSet1, dataSet2, labels, tooltips }) {
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [graphOptions, setGraphOptions] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const sizeRef = React.useRef(null);
  //force update size canvas -> to fix
  const forceReload = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1);
  };
  useEffect(() => {
    const handleStorageChange = () => {
      forceReload();
    };
    window.addEventListener("sideBar", handleStorageChange);
    return () => {
      window.removeEventListener("sideBar", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    setGraphOptions({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        // to remove the labels
        x: {
          // to remove the x-axis grid
          grid: {
            drawBorder: false,
            display: false,
          },

          ticks: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          border: {
            display: false,
          },
          grid: {
            color: "#F3F4F6",
            lineWidth: 2,
          },
          ticks: {
            padding: 15,
            color: "#111827",
            font: {
              family: "Marianne",
              size: 14,
              weight: 400,
            },
          },
        },
      },

      plugins: {
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      onHover: function (evt, elems) {
        if (elems.length > 0) {
          const yParent = sizeRef.current.clientHeight;

          const x = elems[0].element.x;
          const y = elems[0].element.y;

          //calulate the position of the tooltip
          const xTooltip = Math.round(x);
          const yTooltip = Math.round(yParent - y + 20);

          const index = elems[0].index;

          setTooltip({
            style: {
              left: xTooltip + "px",
              bottom: yTooltip + "px",
              transition: "all ease-in-out .2s",
              display: "block",
            },
            value: (
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-bold text-white">{tooltips[index].value}</p>
                <p className="text-xs font-normal text-white">inscrits</p>
                <p className="text-xs font-normal text-white"> ({tooltips[index].date})</p>
              </div>
            ),
          });
        } else {
          setTooltip(null);
        }
      },
    });

    setGraphData({
      labels,
      datasets: [
        {
          data: dataSet1,
          borderColor: "#1D4ED8",
          backgroundColor: "#1D4ED8",
          pointRadius: 5,
          borderWidth: 2,
        },

        {
          data: dataSet2,
          pointRadius: 0,
          borderColor: "#93C5FD",
          borderWidth: 1,
        },
      ],
    });
    setLoading(false);
  }, [dataSet1, dataSet2, labels]);

  if (loading) return null;

  return (
    <div ref={sizeRef} className="w-full relative">
      <Line options={graphOptions} data={graphData} height="230px" />
      {tooltip && <GraphTooltip style={tooltip.style}>{tooltip.value}</GraphTooltip>}
    </div>
  );
}

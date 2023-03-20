import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { graphColors } from "./graph-commons";

export default function FullDoughnut({ title, values, labels, maxLegends = Number.MAX_VALUE, legendSide = "bottom", className = "" }) {
  const [graphOptions, setGraphOptions] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [legendGroups, setLegendGroups] = useState([]);

  useEffect(() => {
    if (values) {
      const dataColors = graphColors[values.length];

      setGraphOptions({
        cutout: "62%",
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false,
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

      const legends = values.map((value, idx) => {
        return {
          value,
          name: labels[idx],
          color: dataColors[idx],
        };
      });
      let idx = 0;
      let groups = [];
      while (legends.length - idx > 0) {
        groups.push(legends.slice(idx, idx + maxLegends));
        idx += maxLegends;
      }
      setLegendGroups(groups);
    } else {
      setGraphData(null);
      setGraphOptions(null);
      setLegendGroups([]);
    }
  }, [values]);

  let mainClass = "flex items-center";
  let graphClass = "relative w-[168px] h-[168px]";
  let legendsClass = "flex";
  let legendClass = "";
  let legendValueClass = "flex items-center";
  let legendDotClass = "mr-2";
  let legendGroupClass = "flex";

  switch (legendSide) {
    case "left":
      mainClass += " flex-row-reverse";
      legendGroupClass += " flex-col mr-10";
      legendClass += "flex flex-col items-end mb-[16px] last:mb-0";
      legendValueClass += " flex-row-reverse";
      legendDotClass = "ml-2";
      break;
    case "right":
      mainClass += " flex-row";
      legendGroupClass += " flex-col ml-10";
      legendClass += " mb-[16px] last:mb-0";
      break;
    case "top":
      mainClass += " flex-col-reverse";
      legendsClass += " flex-col mb-12";
      legendGroupClass += " mb-2 last:mb-0";
      legendClass += " mr-7 last:mr-0";
      break;
    case "bottom":
    default:
      mainClass += " flex-col";
      legendsClass += " flex-col mt-12";
      legendGroupClass += " mb-2 last:mb-0";
      legendClass += " mr-7 last:mr-0";
  }

  return (
    <div className={`${mainClass} ${className}`}>
      <div className={graphClass}>
        {graphData && <Doughnut data={graphData} options={graphOptions} />}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center text-gray-900 text-sm font-bold">{title}</div>
      </div>
      <div className={legendsClass}>
        {legendGroups.map((legends, idx) => (
          <div className={legendGroupClass} key={"group-" + idx}>
            {legends.map((legend) => (
              <div className={legendClass} key={legend.name}>
                <div className="text-xs text-gray-600 mb-[4px]">{legend.name}</div>
                <div className={legendValueClass}>
                  <div className={`rounded-full w-[10px] h-[10px] ${legendDotClass}`} style={{ backgroundColor: legend.color }}></div>
                  <div className="font-medium text-lg text-gray-900">{legend.value}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

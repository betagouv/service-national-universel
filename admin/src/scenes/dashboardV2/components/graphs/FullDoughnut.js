import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { graphColors } from "./graph-commons";

export default function FullDoughnut({ title, values, labels, maxLegends = Number.MAX_VALUE, legendSide = "bottom", className = "" }) {
  const [graphOptions, setGraphOptions] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [legends, setLegends] = useState([]);

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
        layout: {
          padding: { left: 1, right: 1, top: 1, bottom: 1, [legendSide]: 40 },
        },
        onHover: function (evt, elems) {
          console.log("Evt: ", evt);
          console.log("elems: ", elems);
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
            hoverBorderWidth: 2,
            hoverBorderColor: "rgb(30 58 138)",
            borderWidth: 0,
            width: 0,
            height: 0,
            padding: 0,
          },
        ],
      });

      let legends = values.map((value, idx) => {
        return {
          value,
          name: labels[idx],
          color: dataColors[idx],
        };
      });
      // sort legends to be displayed by grid
      if (legends.length > maxLegends) {
        switch (legendSide) {
          case "left": {
            const cols = Math.ceil(legends.length / maxLegends);
            let newLegends = [];
            for (let j = 0; j < maxLegends; ++j) {
              for (let i = cols - 1; i >= 0; --i) {
                const idx = i * cols + j;
                if (idx < legends.length) {
                  newLegends.push(legends[idx]);
                } else {
                  newLegends.push(null);
                }
              }
            }
            legends = newLegends;
            break;
          }
          case "right": {
            const cols = Math.ceil(legends.length / maxLegends);
            let newLegends = [];
            for (let j = 0; j < maxLegends; ++j) {
              for (let i = 0; i < cols; ++i) {
                const idx = i * cols + j;
                if (idx < legends.length) {
                  newLegends.push(legends[idx]);
                } else {
                  newLegends.push(null);
                }
              }
            }
            legends = newLegends;
            break;
          }
          case "bottom":
          case "top":
            // rien à faire, c'est déjà dans le bon sens.
            break;
        }
      }
      setLegends(legends);
    } else {
      setGraphData(null);
      setGraphOptions(null);
      setLegends([]);
    }
  }, [values]);

  let mainClass = "flex items-center";
  let graphClass = "relative w-[168px] h-[168px]";
  let legendsClass = "";
  let legendClass = "";
  let legendValueClass = "flex items-center";
  let legendDotClass = "mr-2";
  let titleClass = "";
  let legendGroupClass = "flex";
  let textLegendClass = "";

  switch (legendSide) {
    case "left":
      mainClass += " flex-row-reverse";
      legendClass += "flex flex-col items-end mb-[16px] last:mb-0";
      legendValueClass += " flex-row-reverse";
      legendDotClass = "ml-2";
      if (maxLegends > legends.length) {
        legendsClass = "";
      } else {
        legendsClass = `grid grid-cols-${maxLegends}`;
      }
      titleClass = "ml-10 py-[44px]";
      textLegendClass = "text-right";
      break;
    case "right":
      mainClass += " flex-row";
      legendClass += " mb-[16px] last:mb-0";
      if (maxLegends > legends.length) {
        legendsClass = "";
      } else {
        legendsClass = `grid grid-cols-${maxLegends}`;
      }
      titleClass = "mr-10 py-[44px]";
      textLegendClass = "text-left";
      break;
    case "top":
      mainClass += " flex-col-reverse";
      if (maxLegends > legends.length) {
        legendsClass = "flex justify-center";
      } else {
        legendsClass = `grid grid-cols-${maxLegends}`;
      }
      legendClass += " mr-7 last:mr-0";
      titleClass = "mt-10 px-[44px]";
      break;
    case "bottom":
    default:
      mainClass += " flex-col";
      if (maxLegends > legends.length) {
        legendsClass = "flex justify-center";
      } else {
        legendsClass = `grid grid-cols-${maxLegends}`;
      }
      legendClass += " mr-7 last:mr-0";
      titleClass = "mb-10 px-[44px]";
  }

  return (
    <div className={`${mainClass} ${className}`}>
      <div className={graphClass}>
        {graphData && <Doughnut data={graphData} options={graphOptions} />}
        <div className={`absolute top-[0px] bottom-[0px] left-[0px] right-[0px] flex justify-center items-center text-center text-gray-900 text-sm leading-[1.1em] font-bold p-[24px] pointer-events-none ${titleClass}`}>{title}</div>
      </div>
      <div className={legendsClass}>
        {legends.map((legend) => {
          return legend ? (
            <div className={legendClass} key={legend.name}>
              <div className="text-xs text-gray-600 mb-[4px]">{legend.name}</div>
              <div className={legendValueClass}>
                <div className={`rounded-full w-[10px] h-[10px] ${legendDotClass}`} style={{ backgroundColor: legend.color }}></div>
                <div className="font-medium text-lg text-gray-900">{legend.value}</div>
              </div>
            </div>
          ) : (
            <div></div>
          );
        })}
      </div>
    </div>
  );
}

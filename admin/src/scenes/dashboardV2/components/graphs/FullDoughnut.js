import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {getGraphColors, graphColors} from "./graph-commons";
import GraphTooltip from "./GraphTooltip";
import InformationCircle from "../../../../assets/icons/InformationCircle";
import MoreInfoPanel from "../MoreInformationPanel";

export default function FullDoughnut({
  title,
  values,
  valueSuffix,
  labels,
  tooltips,
  tooltipsPercent = false,
  maxLegends = Number.MAX_VALUE,
  legendSide = "bottom",
  legendInfoPanels = [],
  className = "",
}) {
  const [graphOptions, setGraphOptions] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [legends, setLegends] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    console.log("info panels = ", legendInfoPanels);
    if (values) {
      const dataColors = getGraphColors(values.length);
      const totalValues = values.reduce((acc, val) => acc + val, 0);

      setGraphOptions({
        cutout: "62%",
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
        layout: {
          padding: { left: 1, right: 1, top: 1, bottom: 1, [legendSide]: 40 },
        },
        onHover: function (evt, elems) {
          if ((tooltips || tooltipsPercent) && elems.length > 0) {
            if (tooltipsPercent || tooltips.length > elems[0].index) {
              let centerX, centerY;
              switch (legendSide) {
                case "top":
                  centerX = 84;
                  centerY = 64;
                  break;
                case "bottom":
                  centerX = 84;
                  centerY = 104;
                  break;
                case "left":
                  centerX = 104;
                  centerY = 84;
                  break;
                case "right":
                  centerX = 64;
                  centerY = 84;
                  break;
              }
              const angle = elems[0].element.startAngle + (elems[0].element.endAngle - elems[0].element.startAngle) / 2;
              const x = Math.cos(angle) * (elems[0].element.outerRadius - 10);
              const y = Math.sin(angle) * (elems[0].element.outerRadius - 10);
              const left = Math.round(centerX + x);
              const bottom = Math.round(centerY + 17 - y);

              let value;
              if (tooltipsPercent) {
                value = totalValues ? Math.round((values[elems[0].index] / totalValues) * 100) + "%" : "-";
              } else {
                value = tooltips[elems[0].index];
              }

              setTooltip({
                style: {
                  left: left + "px",
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
          color: dataColors[idx % dataColors.length],
          info: legendInfoPanels && legendInfoPanels.length > idx ? legendInfoPanels[idx] : undefined,
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
  let graphClass = "relative w-[168px] h-[168px] shrink-0";
  let legendsClass = "shrink-0";
  let legendClass = "";
  let legendValueClass = "flex items-center";
  let legendDotClass = "mr-2";
  let titleClass = "";
  let textLegendClass = "";

  switch (legendSide) {
    case "left":
      mainClass += " flex-row-reverse";
      legendClass += "flex flex-col items-end mb-[16px] last:mb-0";
      legendValueClass += " flex-row-reverse";
      legendDotClass = "ml-2";
      if (maxLegends <= legends.length) {
        legendsClass += ` grid grid-rows-${maxLegends}`;
      }
      titleClass = "ml-10 py-[44px]";
      textLegendClass = "text-right";
      break;
    case "right":
      mainClass += " flex-row";
      legendClass += " mb-[16px] last:mb-0";
      if (maxLegends <= legends.length) {
        legendsClass += ` grid grid-rows-${maxLegends}`;
      }
      titleClass = "mr-10 py-[44px]";
      textLegendClass = "text-left";
      break;
    case "top":
      mainClass += " flex-col-reverse";
      if (maxLegends > legends.length) {
        legendsClass += " flex justify-center";
      } else {
        legendsClass += ` grid grid-cols-${maxLegends}`;
      }
      legendClass += " mr-7 last:mr-0";
      titleClass = "mt-10 px-[44px]";
      break;
    case "bottom":
    default:
      mainClass += " flex-col";
      if (maxLegends > legends.length) {
        legendsClass += " flex justify-center";
      } else {
        legendsClass += ` grid grid-cols-${maxLegends}`;
      }
      legendClass += " mr-7 last:mr-0";
      titleClass = "mb-10 px-[44px]";
  }

  return (
    <div className={`${mainClass} ${className}`}>
      <div className={`relative ${graphClass}`}>
        {graphData && <Doughnut data={graphData} options={graphOptions} />}
        <div
          className={`absolute top-[0px] bottom-[0px] left-[0px] right-[0px] flex justify-center items-center text-center text-gray-900 text-sm leading-[1.1em] font-bold p-[24px] pointer-events-none ${titleClass}`}>
          {title}
        </div>
        {tooltip && <GraphTooltip style={tooltip.style}>{tooltip.value}</GraphTooltip>}
      </div>
      <div className={legendsClass}>
        {legends.map((legend) => {
          return legend ? (
            <div className={legendClass} key={legend.name}>
              <div className={`text-xs text-gray-600 mb-[4px] ${textLegendClass}`}>{legend.name}</div>
              <div className={legendValueClass}>
                <div className={`rounded-full w-[10px] h-[10px] ${legendDotClass}`} style={{ backgroundColor: legend.color }}></div>
                <div className="font-medium text-lg text-gray-900">{legend.value}{valueSuffix}</div>
                {legend.info && <MoreInfoPanel>{legend.info}</MoreInfoPanel>}
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

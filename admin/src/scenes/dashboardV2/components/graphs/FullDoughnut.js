import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { getGraphColors } from "./graph-commons";
import GraphTooltip from "./GraphTooltip";
import MoreInfoPanel from "../ui/MoreInformationPanel";
import { Link } from "react-router-dom";

const CANVAS_SIZE = 208;
const CANVAS_MARGIN = 20;
const TOOLTIP_OFFSET = 17;
const TITTLE_OFFSET = 44;
const LEGEND_PADDING = 40;
const CANVAS_MID = CANVAS_SIZE / 2;

export default function FullDoughnut({
  title,
  values,
  valueSuffix,
  labels,
  tooltips,
  tooltipsPercent = false,
  legendUrls,
  onLegendClicked = () => {},
  maxLegends = Number.MAX_VALUE,
  legendSide = "bottom",
  legendInfoPanels = [],
  className = "",
}) {
  const [graphOptions, setGraphOptions] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [legends, setLegends] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [dataIsZero, setDataIsZero] = useState(true);
  const [legendCols, setLegendCols] = useState(maxLegends);

  useEffect(() => {
    if (values) {
      let completeValues = [];
      const dataColors = getGraphColors(values.length);
      const totalValues = values.reduce((acc, val) => acc + val, 0);
      setDataIsZero(totalValues === 0);

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
          padding: { left: 1, right: 1, top: 1, bottom: 1, [legendSide]: LEGEND_PADDING },
        },
        onHover: function (evt, elems) {
          if ((tooltips || tooltipsPercent) && elems.length > 0) {
            if (tooltipsPercent || tooltips.length > elems[0].index) {
              let centerX, centerY;
              switch (legendSide) {
                case "top":
                  centerX = CANVAS_MID;
                  centerY = CANVAS_MID - CANVAS_MARGIN;
                  break;
                case "bottom":
                  centerX = CANVAS_MID;
                  centerY = CANVAS_MID + CANVAS_MARGIN;
                  break;
                case "left":
                  centerX = CANVAS_MID + CANVAS_MARGIN;
                  centerY = CANVAS_MID;
                  break;
                case "right":
                  centerX = CANVAS_MID - CANVAS_MARGIN;
                  centerY = CANVAS_MID;
                  break;
              }
              const angle = elems[0].element.startAngle + (elems[0].element.endAngle - elems[0].element.startAngle) / 2;
              const x = Math.cos(angle) * (elems[0].element.outerRadius - 10);
              const y = Math.sin(angle) * (elems[0].element.outerRadius - 10);
              const left = Math.round(centerX + x);
              const bottom = Math.round(centerY + TOOLTIP_OFFSET - y);

              let value;
              if (tooltipsPercent) {
                value = totalValues ? Math.round((completeValues[elems[0].index].value / totalValues) * 100) + "%" : "-";
              } else {
                value = completeValues[elems[0].index].tooltip;
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

      let legends = values.map((value, idx) => {
        return {
          value,
          name: labels[idx],
          color: dataColors[idx % dataColors.length],
          info: legendInfoPanels && legendInfoPanels.length > idx ? legendInfoPanels[idx] : undefined,
          url: legendUrls && legendUrls.length > idx ? legendUrls[idx] : undefined,
        };
      });

      // filter values
      if (totalValues !== 0) {
        for (let i = 0, n = values.length; i < n; ++i) {
          if (values[i] / totalValues >= 0.01) {
            completeValues.push({
              value: values[i],
              legend: legends[i],
              tooltip: tooltips ? tooltips[i] : null,
            });
          }
        }
      }

      // graph data
      setGraphData({
        labels,
        title,
        datasets: [
          {
            data: completeValues.map((cv) => cv.value),
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

      // sort legends to be displayed by grid
      legends = completeValues.map((cv) => cv.legend);
      let legendCols = maxLegends;
      switch (legendSide) {
        case "left": {
          legendCols = Math.ceil(legends.length / maxLegends);
          let newLegends = [];
          for (let j = 0; j < maxLegends; ++j) {
            for (let i = legendCols - 1; i >= 0; --i) {
              const idx = i * maxLegends + j;
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
          legendCols = Math.ceil(legends.length / maxLegends);
          let newLegends = [];
          for (let j = 0; j < maxLegends; ++j) {
            for (let i = 0; i < legendCols; ++i) {
              const idx = i * maxLegends + j;
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
          legendCols = maxLegends;
          break;
      }
      setLegendCols(legendCols);
      setLegends(legends);
    } else {
      setGraphData(null);
      setGraphOptions(null);
      setLegends([]);
    }
  }, [values]);

  let mainClass = "flex items-center";
  // let graphClass = `relative w-[${CANVAS_SIZE}px] h-[${CANVAS_SIZE}px] shrink-0 grow-0`;
  let graphClass = `relative w-[208px] h-[208px] shrink-0 grow-0`;
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
      legendsClass += ` grid grid-cols-${legendCols} gap-2`;
      // titleClass += `ml-10 py-[${TITTLE_OFFSET}px]`;
      titleClass += `ml-10 py-[44px]`;
      textLegendClass = "text-right";
      break;
    case "right":
      mainClass += " flex-row";
      legendClass += " mb-[16px] last:mb-0";
      legendsClass += ` grid grid-cols-${legendCols} gap-2`;
      // titleClass += `mr-10 py-[${TITTLE_OFFSET}px]`;
      titleClass += `mr-10 py-[44px]`;
      textLegendClass = "text-left";
      break;
    case "top":
      mainClass += " flex-col-reverse";
      if (maxLegends > legends.length) {
        legendsClass += " flex justify-center";
      } else {
        legendsClass += ` grid grid-cols-${legendCols} gap-2`;
      }
      legendClass += " mr-7 last:mr-0";
      // titleClass += `mt-10 px-[${TITTLE_OFFSET}px]`;
      titleClass += `mt-10 px-[44px]`;
      break;
    case "bottom":
    default:
      mainClass += " flex-col";
      if (maxLegends > legends.length) {
        legendsClass += " flex justify-center";
      } else {
        legendsClass += ` grid grid-cols-${legendCols} gap-2`;
      }
      legendClass += " mr-7 last:mr-0";
      // titleClass += `mb-10 px-[${TITTLE_OFFSET}px]`;
      titleClass += `mb-10 px-[44px]`;
  }

  const graphZeroData = {
    labels: [""],
    datasets: [
      {
        data: [1],
        backgroundColor: "rgb(243 244 246)",
        hoverBackgroundColor: "rgb(243 244 246)",
        hoverBorderWidth: 0,
        hoverBorderColor: "rgb(243 244 246)",
        borderWidth: 0,
        width: 0,
        height: 0,
        padding: 0,
      },
    ],
  };

  const graphZeroOption = {
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
      padding: { left: 1, right: 1, top: 1, bottom: 1, [legendSide]: LEGEND_PADDING },
    },
  };

  const LegendContent = ({ name, value, color, info }) => {
    return (
      <>
        <div className={`mb-[4px] text-xs text-gray-600 ${textLegendClass}`}>{name}</div>
        <div className={legendValueClass}>
          <div className={`h-[10px] w-[10px] rounded-full ${legendDotClass}`} style={{ backgroundColor: color }}></div>
          <div className="text-lg font-medium text-gray-900">
            {value}
            {valueSuffix}
          </div>
          {info && <MoreInfoPanel>{info}</MoreInfoPanel>}
        </div>
      </>
    );
  };

  function stopPropagation(event) {
    event.stopPropagation();
  }

  return (
    <div className={`${mainClass} ${className}`}>
      <div className={graphClass}>
        {dataIsZero ? <Doughnut data={graphZeroData} options={graphZeroOption} /> : graphData && <Doughnut data={graphData} options={graphOptions} />}
        <div
          className={`pointer-events-none absolute top-[0px] bottom-[0px] left-[0px] right-[0px] flex items-center justify-center p-[24px] text-center text-sm font-bold leading-[1.1em] text-gray-900 ${titleClass}`}>
          {title}
        </div>
        {tooltip && <GraphTooltip style={tooltip.style}>{tooltip.value}</GraphTooltip>}
      </div>
      <div className={legendsClass} onClick={(event) => stopPropagation(event)}>
        {legends.map((legend, idx) => {
          return legend ? (
            legend?.url ? (
              <Link to={legend.url} target={"_blank"} className="legendClass" key={legend.name + "-" + idx}>
                <LegendContent name={legend.name} value={legend.value} color={legend.color} info={legend.info} />
              </Link>
            ) : (
              <div className={legendClass} key={legend.name + "-" + idx} onClick={() => onLegendClicked(idx, legend.name, legend.value, legend.color)}>
                <LegendContent name={legend.name} value={legend.value} color={legend.color} info={legend.info} />
              </div>
            )
          ) : (
            <div key={"nolegend-" + idx}></div>
          );
        })}
      </div>
    </div>
  );
}

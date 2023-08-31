import React, { useEffect, useState } from "react";
import { getGraphColors } from "./graph-commons";
import GraphTooltip from "./GraphTooltip";

export default function HorizontalBar({ title, values, labels, showTooltips = false, legendUrls, goal, className = "", onLegendClicked = () => {} }) {
  const [bars, setBars] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPercent, setTotalPercent] = useState("-");
  const [x100, setX100] = useState(null);

  useEffect(() => {
    if (values && values.length > 0) {
      const total = values.reduce((value, originalValue) => value + originalValue, 0);

      setTotal(total);
      setTotalPercent(goal === 0 ? "100%" : Math.round((total / goal) * 100) + "%");

      const localGoal = goal === 0 ? total : goal;

      const colors = getGraphColors(values.length);
      setBars(
        values.map((value, idx) => {
          return {
            color: colors[idx % colors.length],
            label: labels[idx],
            value,
            percent: localGoal === 0 ? "-" : Math.round((value / localGoal) * 100) + "%",
            width: Math.min(Math.round((value / Math.max(total, localGoal)) * 100), 100),
            tooltip: showTooltips ? (localGoal === 0 ? "-" : Math.round((value / localGoal) * 100) + "%" + " " + labels[idx].toLowerCase()) : null,
          };
        }),
      );

      if (total > goal) {
        setX100(Math.round((goal / total) * 100));
      } else {
        setX100(null);
      }
    } else {
      setBars([]);
      setTotal(0);
      setTotalPercent(0);
      setX100(null);
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
    <div className={` ${className}`}>
      <div className="mb-4 flex justify-between">
        {title && (
          <div className="text-base font-bold text-gray-900">
            {title} : {goal}
          </div>
        )}
        <div className="text-right text-base font-medium text-gray-900">
          <span>Total :</span> <span className="font-bold">{totalPercent}</span> <span className="font-normal text-[#9CA3AF]">({total})</span>
        </div>
      </div>
      <div className="relative">
        <div className="h-[31px] rounded-full flex justify-start bg-gray-100">
          {bars.map((bar, idx) => {
            return bar.width > 0 ? (
              <div
                className="group relative inline-block h-[100%] first:rounded-l-full last:rounded-r-full  hover:z-10 hover:scale-y-[1.05]"
                style={{ width: bar.width + "%", backgroundColor: bar.color }}
                key={"bar-" + idx}>
                {bar.tooltip && <GraphTooltip className="w-36">{bar.tooltip}</GraphTooltip>}
              </div>
            ) : null;
          })}
        </div>
        {x100 ? (
          <div className="absolute top-[-4px] bottom-[-4px] z-20 w-[5px] rounded-full border-[1px] border-white bg-red-600" style={{ left: x100 + "%" }}>
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 rounded-[4px] border-[1px] border-white bg-red-600 py-[2px] px-1 text-[8px] font-bold text-white">
              100%
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-4 mr-8 flex justify-between last:mr-0">
        {bars.map((bar, idx) => (
          <div key={"legend-" + idx} className="cursor-pointer" onClick={() => clickOnLegend({ index: idx, label: bar.label, value: bar.percent, color: bar.color })}>
            <div className="flex">
              <div className="mr-2 mt-2 h-[12px] w-[12px] rounded-full" style={{ backgroundColor: bar.color }}></div>
              <div>
                <div className="text-base font-bold text-gray-900">{bar.percent}</div>
                <div className="text-sm font-medium text-gray-600">{bar.label}</div>
                <div className="text-sm text-[#9CA3AF]">({bar.value})</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

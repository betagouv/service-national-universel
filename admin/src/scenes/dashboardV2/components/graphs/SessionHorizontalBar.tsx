import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Assuming you are using react-router
import { getGraphColors } from "./graph-commons";
import GraphTooltip from "./GraphTooltip";

interface SessionHorizontalBarProps {
  title: string;
  values: number[];
  labels: string[];
  showTooltips: boolean;
  legendUrls?: string[];
  goal: number;
  className?: string;
}

interface BarProps {
  color: string;
  label: string;
  value: number;
  percent: string;
  width: number;
  tooltip: string | null;
}

export default function SessionHorizontalBar({ title, values, labels, showTooltips = false, goal, className = "" }: SessionHorizontalBarProps) {
  const [bars, setBars] = useState<BarProps[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [x100, setX100] = useState<number | null>(null);

  useEffect(() => {
    if (values && values.length > 0) {
      const total = values.reduce((value, originalValue) => value + originalValue, 0);
      setTotal(total);
      const localGoal = goal === 0 ? total : goal;
      const colors = ["#1E40AF", "#E5E7EB"];

      setBars(
        values.map((value, idx) => ({
          color: colors[idx % colors.length],
          label: labels[idx],
          value,
          percent: localGoal === 0 ? "-" : `${Math.round((value / localGoal) * 100)}%`,
          width: Math.min(Math.round((value / Math.max(total, localGoal)) * 100), 100),
          tooltip: showTooltips ? (localGoal === 0 ? "-" : `${Math.round((value / localGoal) * 100)}% ${labels[idx].toLowerCase()}`) : null,
        })),
      );

      if (total > goal) {
        setX100(Math.round((goal / total) * 100));
      } else {
        setX100(null);
      }
    } else {
      setBars([]);
      setTotal(0);
      setX100(null);
    }
  }, [values, goal, labels, showTooltips]);

  return (
    <div className={className}>
      <div className="mb-2 flex justify-between">
        {title && (
          <div className="text-base font-bold text-gray-900">
            {title}
          </div>
        )}
        <div className="text-right text-base font-medium text-gray-900">
          <span>Total :</span> <span className="font-bold">{total}</span>
        </div>
      </div>
      <div className="relative">
        <div className="h-[31px] rounded-full flex justify-start bg-gray-100">
          {bars.map(
            (bar, idx) =>
              bar.width > 0 && (
                <div
                  className="group relative inline-block h-[100%] first:rounded-l-full last:rounded-r-full hover:z-10 hover:scale-y-[1.05]"
                  style={{ width: `${bar.width}%`, backgroundColor: bar.color }}
                  key={`bar-${idx}`}>
                  {bar.tooltip && <GraphTooltip className="w-36">{bar.tooltip}</GraphTooltip>}
                </div>
              ),
          )}
        </div>
        {x100 && (
          <div className="absolute top-[-4px] bottom-[-4px] z-20 w-[5px] rounded-full border-[1px] border-white bg-red-600" style={{ left: `${x100}%` }}>
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 rounded-[4px] border-[1px] border-white bg-red-600 py-[2px] px-1 text-[8px] font-bold text-white">
              100%
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 mr-8 flex justify-center last:mr-0">
        {bars.map((bar, idx) => (
          <div key={`legend-${idx}`} className="cursor-pointer mr-6">
            <div className="flex">
              <div className="mr-2 mt-2 h-[12px] w-[12px] rounded-full" style={{ backgroundColor: bar.color }}></div>
              <div className="flex flex-row justify-center item-center">
                <div className="text-base font-bold text-gray-900 mr-1">{bar.value}</div>
                <div className="text-sm font-medium text-gray-600 text-center mt-0.5">{bar.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

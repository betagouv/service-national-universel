import React from "react";
import GraphTooltip from "./GraphTooltip";

interface SessionHorizontalBarProps {
  title: string;
  values: number[];
  labels: string[];
  showTooltips: boolean;
  goal: number;
  className?: string;
}

interface BarProps {
  color: string;
  label: string;
  value: number;
  width: number;
  tooltip: string | null;
}

export default function SessionHorizontalBar({ title, values, labels, showTooltips = false, goal, className = "" }: SessionHorizontalBarProps) {
  if (!values || values.length === 0) return null;

  const total = values.reduce((sum, value) => sum + value, 0);
  const localGoal = goal === 0 ? total : goal;
  const colors = ["#1D4ED8", "#E5E7EB"];

  const bars: BarProps[] = values.map((value, idx) => ({
    color: colors[idx % colors.length],
    label: labels[idx],
    value,
    width: Math.min(Math.round((value / Math.max(total, localGoal)) * 100), 100),
    tooltip: showTooltips ? (localGoal === 0 ? "-" : `${Math.round((value / localGoal) * 100)}% ${labels[idx].toLowerCase()}`) : null,
  }));

  const x100 = total > goal ? Math.round((goal / total) * 100) : null;

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
        <div className="h-[10px] rounded-full flex justify-start bg-gray-100">
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

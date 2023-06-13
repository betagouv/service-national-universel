import React from "react";

export const graphColors = {
  1: ["#1E40AF"],
  2: ["#1E40AF", "#60A5FA"],
  3: ["#1E40AF", "#3B82F6", "#93C5FD"],
  4: ["#1E40AF", "#2563EB", "#60A5FA", "#93C5FD"],
  5: ["#1E40AF", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"],
  6: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"],
  7: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"],
  8: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1E40AF"],
  9: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1E40AF", "#1D4ED8"],
  10: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1E40AF", "#1D4ED8", "#2563EB"],
  11: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6"],
  12: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA"],
  13: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"],
  14: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"],
};
export function getGraphColors(count) {
  return graphColors[Math.max(1, Math.min(14, count))];
}

export function Legend({ color, name, value = null, noValue = false, className = "", onClick = () => {} }) {
  return (
    <div className={`flex flex-row-reverse items-center gap-2 ${className}`} onClick={onClick}>
      <div className="text-xs text-gray-600">{name}</div>
      <div className={`flex items-center`}>
        <div className={`h-[10px] w-[10px] rounded-full`} style={{ backgroundColor: color }}></div>
        <div className="ml-2 text-lg font-medium text-gray-900">{noValue ? null : value ? value : 0}</div>
      </div>
    </div>
  );
}

export function Legends({ labels, values = null, noValue = false, legendUrls, className = "", onLegendClicked = () => {} }) {
  const colors = getGraphColors(labels.length);

  function clickOnLegend({ index, label, value, color }) {
    if (legendUrls && legendUrls[index]) {
      window.open(legendUrls[index], "_blank");
    } else {
      onLegendClicked(index, label, value, color);
    }
  }

  return (
    <div className={`flex ${className}`}>
      {labels.map((label, idx) => (
        <Legend
          color={colors[idx % colors.length]}
          name={label}
          value={values ? values[idx] : 0}
          noValue={noValue}
          key={label}
          className="mr-4 last:mr-0"
          onClick={() => clickOnLegend({ index: idx, label, value: values ? values[idx] : 0, color: colors[idx] })}
        />
      ))}
    </div>
  );
}

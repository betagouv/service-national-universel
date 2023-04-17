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

export function Legend({ color, name, value = null, className = "", onClick = () => {} }) {
  return (
    <div className={`flex flex-row-reverse items-center ${className}`} onClick={onClick}>
      <div className="text-xs text-gray-600 ml-2">{name}</div>
      <div className={`flex items-center`}>
        <div className={`rounded-full w-[10px] h-[10px]`} style={{ backgroundColor: color }}></div>
        <div className="font-medium text-lg text-gray-900 ml-2">{value ? value : 0}</div>
      </div>
    </div>
  );
}

export function Legends({ labels, values = null, legendUrls, className = "", onLegendClicked = () => {} }) {
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
          key={label}
          className="mr-4 last:mr-0"
          onClick={() => clickOnLegend({ index: idx, label, value: values ? values[idx] : 0, color: colors[idx] })}
        />
      ))}
    </div>
  );
}

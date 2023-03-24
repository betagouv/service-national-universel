import React from "react";

export const graphColors = {
  1: ["#1E40AF"],
  2: ["#1E40AF", "#60A5FA"],
  3: ["#1E40AF", "#3B82F6", "#93C5FD"],
  4: ["#1E40AF", "#2563EB", "#60A5FA", "#93C5FD"],
  5: ["#1E40AF", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"],
  6: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"],
  7: ["#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"],
};

export function Legend({ color, name, value = null, className = "" }) {
  return (
    <div className={`flex flex-row-reverse items-center ${className}`}>
      <div className="text-xs text-gray-600 ml-2">{name}</div>
      <div className={`flex items-center`}>
        <div className={`rounded-full w-[10px] h-[10px]`} style={{ backgroundColor: color }}></div>
        {value !== null && value !== undefined && <div className="font-medium text-lg text-gray-900 ml-2">{value}</div>}
      </div>
    </div>
  );
}

export function Legends({ labels, values = null, className = "" }) {
  const colors = graphColors[labels.length];
  return (
    <div className={`flex ${className}`}>
      {labels.map((label, idx) => (
        <Legend color={colors[idx]} name={label} value={values ? values[idx] : null} key={labels} className="mr-4 last:mr-0" />
      ))}
    </div>
  );
}

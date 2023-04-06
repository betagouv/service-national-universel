import React from "react";

export const graphColors = {
  1: ["#1E40AF"],
  2: ["#60A5FA", "#1E40AF"],
  3: ["#93C5FD", "#3B82F6", "#1E40AF"],
  4: ["#93C5FD", "#60A5FA", "#2563EB", "#1E40AF"],
  5: ["#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1E40AF"],
  6: ["#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF"],
  7: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF"],
  8: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#BFDBFE"],
  9: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#BFDBFE", "#93C5FD"],
  10: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#BFDBFE", "#93C5FD", "#60A5FA"],
  11: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6"],
  12: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB"],
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
        <Legend color={colors[idx]} name={label} value={values ? values[idx] : null} key={label} className="mr-4 last:mr-0" />
      ))}
    </div>
  );
}

import React from "react";

export default function DashboardBox({ title, children, className = "", headerChildren = null }) {
  return (
    <div className={`mt-6 bg-white rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.05)] px-6 py-4 ${className}`}>
      <div className="flex justify-between items-start">
        <h2 className="text-base font-bold text-gray-900 mt-0">{title}</h2>
        <div className="">{headerChildren}</div>
      </div>
      <div className="">{children}</div>
    </div>
  );
}

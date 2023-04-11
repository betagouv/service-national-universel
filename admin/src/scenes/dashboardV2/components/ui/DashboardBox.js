import React from "react";

export default function DashboardBox({ title, children, className = "", headerChildren = null, subtitle = null }) {
  return (
    <div className={`mt-6 bg-white rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.05)] px-6 py-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-bold text-gray-900 mt-0">{title}</h2>
          {subtitle && <h3 className="text-sm text-gray-500">{subtitle}</h3>}
        </div>
        <div className="">{headerChildren}</div>
      </div>
      <div className="">{children}</div>
    </div>
  );
}

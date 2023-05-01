import React from "react";
import { Link } from "react-router-dom";

export default function DashboardBox(props) {
  if (props.to) {
    return (
      <Link to={props.to} target="_blank" className={`mt-6 rounded-lg bg-white px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)] hover:text-gray-900 ${props.className}`}>
        <BoxContent {...props} />
      </Link>
    );
  } else {
    return (
      <div className={`mt-6 rounded-lg bg-white px-6 py-4 shadow-[0_8px_16px_rgba(0,0,0,0.05)] ${props.className}`}>
        <BoxContent {...props} />
      </div>
    );
  }
}

function BoxContent({ title, children, className = "", headerChildren = null, subtitle = null }) {
  return (
    <>
      <div className={`flex items-start justify-between hover:text-gray-900 ${className}`}>
        <div>
          <h2 className="mt-0 text-base font-bold text-gray-900 hover:text-gray-900">{title}</h2>
          {subtitle && <h3 className="text-sm text-gray-500 hover:text-gray-900">{subtitle}</h3>}
        </div>
        <div className="hover:text-gray-900">{headerChildren}</div>
      </div>
      <div className="hover:text-gray-900">{children}</div>
    </>
  );
}

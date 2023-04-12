import React from "react";

const AlertPrimary = ({ children = null, className = "" }) => <div className={`flex gap-3 p-4 rounded-md bg-blue-50 text-blue-800 text-sm ${className}`}>{children}</div>;

export default AlertPrimary;

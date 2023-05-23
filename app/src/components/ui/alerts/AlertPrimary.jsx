import React from "react";

const AlertPrimary = ({ children = null, className = "" }) => <div className={`flex gap-3 rounded-md bg-blue-50 p-4 text-sm text-blue-800 ${className}`}>{children}</div>;

export default AlertPrimary;

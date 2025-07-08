import React from "react";

const Label = ({ children, required = false, className = "" }) => (
  <label className={`mb-1 inline-block text-sm font-medium text-gray-700 ${className}`}>{`${children}${required ? "*" : ""}`}</label>
);

export default Label;

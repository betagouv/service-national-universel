import React from "react";

const SectionTitle = ({ children = null, className = "" }) => <h3 className={`m-0 mb-2 text-xs font-medium text-gray-900 ${className}`}>{children}</h3>;

export default SectionTitle;

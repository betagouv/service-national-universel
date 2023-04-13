import React from "react";

const FormDescription = ({ children = null, className = "" }) => <p className={`text-sm text-gray-500 mb-6 ${className}`}>{children}</p>;

export default FormDescription;

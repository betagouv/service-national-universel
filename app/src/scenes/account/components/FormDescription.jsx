import React from "react";

const FormDescription = ({ children = null, className = "" }) => <p className={`mb-6 text-sm text-gray-500 ${className}`}>{children}</p>;

export default FormDescription;

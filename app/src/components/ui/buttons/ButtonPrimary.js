import React from "react";

const ButtonPrimary = ({ className = "", children, ...rest }) => (
  <button
    className={`flex justify-center items-center gap-2 px-3 py-2 rounded-md shadow-sm disabled:opacity-60 transition bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600 ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonPrimary;

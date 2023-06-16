import React from "react";

const ButtonSecondary = ({ className = "", children, ...rest }) => (
  <button
    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 drop-shadow-sm bg-gray-100 text-gray-900 text-xs font-medium hover:bg-gray-200 disabled:opacity-60 disabled:hover:text-gray-400 ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonSecondary;

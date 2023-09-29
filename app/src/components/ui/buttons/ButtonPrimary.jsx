import React from "react";

const ButtonPrimary = ({ className = "", children, ...rest }) => (
  <button
    className={`flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 ${
      rest.disabled ? "cursor-not-allowed" : ""
    } ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonPrimary;

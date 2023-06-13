import React from "react";

const ButtonDanger = ({ className = "", children = null, ...rest }) => (
  <button
    className={`flex items-center justify-center gap-2 rounded-md bg-red-500 px-3 py-2 text-white shadow-sm transition hover:bg-red-600 disabled:opacity-60 disabled:hover:bg-red-500 ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonDanger;

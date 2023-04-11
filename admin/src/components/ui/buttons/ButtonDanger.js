import React from "react";

const ButtonDanger = ({ className = "", children = null, ...rest }) => (
  <button
    className={`flex justify-center items-center gap-2 px-3 py-2 rounded-md shadow-sm disabled:opacity-60 transition bg-red-500 text-white hover:bg-red-600 disabled:hover:bg-red-500 ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonDanger;

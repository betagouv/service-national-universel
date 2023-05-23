import React from "react";

const ButtonLight = ({ className = "", children, ...rest }) => (
  <button
    className={`flex items-center justify-center gap-2 rounded-md border-[1px] border-gray-300 bg-white px-3 py-2 text-gray-700 drop-shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:hover:bg-white ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonLight;

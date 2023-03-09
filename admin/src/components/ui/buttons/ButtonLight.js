import React from "react";

const ButtonLight = ({ className = "", children, ...rest }) => (
  <button
    className={`flex justify-center items-center gap-2 px-3 py-2 drop-shadow-sm rounded-md disabled:opacity-60 bg-white border-[1px] text-gray-700 border-gray-300 hover:bg-gray-50 disabled:hover:bg-white ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonLight;

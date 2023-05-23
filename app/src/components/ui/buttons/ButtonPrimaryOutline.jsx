import React from "react";

const ButtonPrimaryOutline = ({ className = "", children, ...rest }) => (
  <button
    className={`flex items-center justify-center gap-2 rounded-md border-[1px] border-blue-600 px-3 py-2 text-sm text-blue-600 transition hover:border-blue-700 hover:text-blue-700 disabled:opacity-60 disabled:hover:border-blue-600 ${className}`}
    {...rest}>
    {children}
  </button>
);

export default ButtonPrimaryOutline;

import React from "react";

const ButtonExternalLinkPrimary = ({ className = "", children, ...rest }) => (
  <a
    className={`flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white drop-shadow-sm transition hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-blue-600 ${className}`}
    {...rest}
    target="_blank"
    rel="noopener noreferrer">
    {children}
  </a>
);

export default ButtonExternalLinkPrimary;

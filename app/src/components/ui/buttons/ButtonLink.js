import React from "react";

const ButtonLink = ({ onClick, children, className = "" }) => (
  <button onClick={onClick} className={`text-blue-600 hover:text-blue-700 ${className} text-xs font-medium`}>
    {children}&nbsp;›
  </button>
);

export default ButtonLink;

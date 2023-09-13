import React from "react";

const InlineButton = ({ onClick, children = "Modifier", className = "" }) => (
  <button type="button" onClick={onClick} className={`text-base text-[#000091] hover:text-[#003f75] underline ${className}`}>
    {children}
  </button>
);

export default InlineButton;

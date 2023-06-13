import React from "react";

const ChangeAddressButton = ({ onClick, children = "J’ai changé d’adresse", className = "" }) => (
  <button type="button" onClick={onClick} className={`text-gray-500 hover:text-gray-700 ${className} text-sm font-medium underline`}>
    {children}
  </button>
);

export default ChangeAddressButton;

import React from "react";

const PrimaryButton = ({ children, disabled = false, onClick, className = "" }) => (
  <button
    className={`w-full md:w-auto flex items-center justify-center border-[1px] border-blue-france-sun-113 py-2 px-4 text-blue-france-sun-113 hover:border-blue-france-sun-113-hover hover:text-blue-france-sun-113-hover ${className}`}
    onClick={onClick}
    disabled={disabled}>
    {children}
  </button>
);

export default PrimaryButton;

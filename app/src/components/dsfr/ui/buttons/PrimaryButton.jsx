import React from "react";

const PrimaryButton = ({ children, disabled = false, onClick, className = "" }) => (
  <button
    className={`flex w-full items-center justify-center bg-blue-france-sun-113 py-2 px-4 text-white hover:bg-blue-france-sun-113-hover disabled:bg-grey-925 disabled:text-grey-625 md:w-auto ${className}`}
    onClick={onClick}
    disabled={disabled}>
    {children}
  </button>
);

export default PrimaryButton;

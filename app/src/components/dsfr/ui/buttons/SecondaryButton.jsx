import React from "react";

const SecondaryButton = ({ onClick, children = "Continuer", disabled = false, className = "" }) => {
  return (
    <button
      disabled={disabled}
      className={`border-blue-france-sun-113 text-blue-france-sun-113 hover:bg-gray-50 flex items-center justify-center border-[1px] px-3 py-2 disabled:bg-[#E5E5E5] disabled:text-[#929292] disabled:cursor-not-allowed disabled:border-[#E5E5E5] ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
};

export default SecondaryButton;

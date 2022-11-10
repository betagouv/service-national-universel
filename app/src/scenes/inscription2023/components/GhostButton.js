import React from "react";

const style = "bg-white border !border-[#000091] shadow-sm text-[#000091]";
const disabledStyle = "bg-[#E5E5E5] text-[#929292] cursor-not-allowed";
const hoveredStyle = "hover:!bg-[#000091] hover:text-white";

const GhostButton = ({ onClick, name, type = undefined, disabled = false, className = "" }) => {
  return (
    <button
      disabled={disabled}
      className={`mt-2 mb-6 w-full py-2 font-medium ${disabled ? disabledStyle : style} ${!disabled && hoveredStyle} ${className}`}
      type={type}
      onClick={onClick}>
      {name}
    </button>
  );
};

export default GhostButton;

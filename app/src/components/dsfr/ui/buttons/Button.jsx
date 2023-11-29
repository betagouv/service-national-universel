import React from "react";

const hoveredStyle = "hover:bg-white hover:shadow-sm hover:!text-[#000091] hover:!border-[#000091]";
const disabledStyle = "bg-[#E5E5E5] text-[#929292] cursor-not-allowed !border-[#E5E5E5]";
const style = "bg-[#000091] border-[#000091] text-white";

const Button = ({ onClick, children = "Continuer", disabled = false, className = "", type }) => {
  return (
    <button
      disabled={disabled}
      type={type}
      className={`flex items-center justify-center border px-3 py-2 ${disabled ? disabledStyle : style} ${!disabled && hoveredStyle} ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;

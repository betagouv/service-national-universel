import React from "react";

function Button({ onClick, children, className = "", disabled = false }) {
  return (
    <button
      disabled={disabled}
      className={`h-[40px] rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;

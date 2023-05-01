import React from "react";

export default function ButtonLight({ className = "", children = null, onClick = () => {}, type = "button", ...rest }) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-center text-sm text-gray-900 transition hover:bg-gray-50 ${className}`}
      {...rest}>
      {children}
    </button>
  );
}

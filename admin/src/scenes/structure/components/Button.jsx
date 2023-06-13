import React from "react";

export default function Button({ disabled, onClick, children, loading, category = "primary", className }) {
  const styles = {
    primary:
      "rounded-lg bg-blue-600 py-2 px-8 text-blue-100 text-sm justify-center disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 active:brightness-125 transition",
    secondary:
      "rounded-lg bg-[#fffff] border-[1px] border-blue-600 py-2 px-8 text-blue-600 text-sm justify-center disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#eff6ff] transition",
    tertiary:
      "border-[1px] rounded-lg border-grey-300 bg-[#ffffff] text-gray-800 py-2 px-8 hover:bg-[#f9fafb] transition text-sm justify-center disabled:opacity-60 disabled:cursor-not-allowed",
  };
  return (
    <button className={`${styles[category]} ${loading && "animate-pulse"} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

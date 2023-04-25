import React from "react";

export default function ButtonLight({ className = "", children = null, onClick = () => {} }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-center text-sm text-gray-900 transition hover:bg-gray-50 ${className}`}>
      {children}
    </button>
  );
}

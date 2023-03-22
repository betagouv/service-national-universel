import React from "react";

export default function ButtonLight({ className = "", children = null, onClick = () => {} }) {
  return (
    <button
      onClick={onClick}
      className={`flex text-sm justify-center items-center gap-2 px-3 py-2 rounded-md text-center text-gray-900 border hover:bg-gray-50 transition ${className}`}>
      {children}
    </button>
  );
}

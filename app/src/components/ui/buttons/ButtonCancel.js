import React from "react";

export default function ButtonCancel({ children, onClick = () => {} }) {
  return (
    <button onClick={onClick} className="text-center text-sm rounded-md text-gray-900 py-2 border hover:bg-gray-50 transition">
      {children}
    </button>
  );
}

import React from "react";

export default function ButtonPlain({ tw = "bg-indigo-600 text-white", children, onClick }) {
  return (
    <button onClick={onClick} className={`${tw} py-[9px] px-4 rounded-md mt-2 hover:shadow-lg`}>
      {children}
    </button>
  );
}

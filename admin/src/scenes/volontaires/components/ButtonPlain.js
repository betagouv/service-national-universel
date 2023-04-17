import React from "react";

export default function ButtonPlain({ tw = "bg-indigo-600 text-white", children, onClick }) {
  return (
    <button onClick={onClick} className={`${tw} mt-2 rounded-md py-[9px] px-4 hover:shadow-lg`}>
      {children}
    </button>
  );
}

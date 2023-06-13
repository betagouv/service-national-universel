import React from "react";

export function BorderButton({ className, children, onClick = () => {} }) {
  return (
    <button
      className={`rounded-[10px] border-[1px] border-blue-600 bg-[#FFFFFF]  py-2.5 px-3 text-sm font-medium text-blue-600 transition duration-150 ease-in-out hover:bg-blue-600 hover:text-[#FFFFFF] ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}

export function PlainButton({ className, children, onClick = () => {} }) {
  return (
    <button
      className={`rounded-[10px] border-[1px] border-blue-600 bg-blue-600  py-2.5 px-3 text-sm font-medium text-[#FFFFFF] transition duration-150 ease-in-out hover:bg-[#FFFFFF] hover:text-blue-600 ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
export function CancelButton({ className, children = "Annuler", onClick = () => {} }) {
  return (
    <button className={`w-full cursor-pointer rounded-lg border-[1px] border-gray-300 py-2 text-gray-700 ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

import React from "react";

export function BorderButton({ className, children, onClick = () => {} }) {
  return (
    <button
      className={`rounded-[10px] border-[1px] py-2.5 px-3  bg-[#FFFFFF] hover:bg-blue-600 border-blue-600 text-blue-600 hover:text-[#FFFFFF] text-sm font-medium transition ease-in-out duration-150 ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}

export function PlainButton({ className, children, onClick = () => {} }) {
  return (
    <button
      className={`rounded-[10px] border-[1px] py-2.5 px-3  bg-blue-600 hover:bg-[#FFFFFF] border-blue-600 text-[#FFFFFF] hover:text-blue-600 text-sm font-medium transition ease-in-out duration-150 ${className}`}
      onClick={onClick}>
      {children}
    </button>
  );
}
export function CancelButton({ className, children = "Annuler", onClick = () => {} }) {
  return (
    <button className={`border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

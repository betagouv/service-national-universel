import React from "react";

export function Table({ children, className = "" }) {
  return <div className={`rounded-lg bg-white shadow ${className}`}>{children}</div>;
}

export function TH({ text, className = "", textTransform = "uppercase" }) {
  return <h6 className={`px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 ${textTransform} ${className}`}>{text}</h6>;
}

export function TR({ children }) {
  return <div className="flex items-center last:rounded-b-lg odd:bg-white even:bg-gray-50">{children}</div>;
}

export function TD({ children, className = "", color = "text-gray-900" }) {
  return <p className={`px-6 py-4 text-sm ${color} ${className}`}>{children}</p>;
}

export function THead({ children, className = "", textTransform = "capitalize" }) {
  return <div className={`flex rounded-t-lg border-b border-gray-200 bg-gray-50 ${textTransform} ${className}`}>{children}</div>;
}
export function TFooter({ children, className = "" }) {
  return <div className={`flex rounded-b-lg border-b border-gray-200 bg-white py-3 px-6 ${className}`}>{children}</div>;
}

export function TBody({ children }) {
  return <div className="flex flex-col justify-between">{children}</div>;
}

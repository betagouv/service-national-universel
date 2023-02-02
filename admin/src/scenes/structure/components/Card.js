import React from "react";

export default function Card({ onClick, children, className }) {
  return (
    <div onClick={onClick} className={`rounded-xl bg-white shadow-sm hover:cursor-pointer hover:scale-105 transition ${className}`}>
      {children}
    </div>
  );
}

import React from "react";

export default function InfoMessage({ bg = "", Icon = null, message = "" }) {
  return (
    <div className={`flex items-center gap-4 rounded-lg ${bg} text-white p-4 text-base leading-5`}>
      <Icon className="text-white w-7 h-7" />
      <span>{message}</span>
    </div>
  );
}

import React from "react";

export default function InfoMessage({ bg = "", Icon = null, message = "" }) {
  return (
    <div className={`flex items-center gap-4 rounded-lg ${bg} p-4 text-base leading-5 text-white`}>
      <Icon className="h-10 w-10 text-white" />
      <span>{message}</span>
    </div>
  );
}

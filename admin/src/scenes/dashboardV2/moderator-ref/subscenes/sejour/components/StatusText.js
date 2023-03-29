import React from "react";

export default function StatusText({ status, nb, percentage }) {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-2 w-[80%]">
        <span className="font-bold text-lg text-gray-900 w-[20%]">{nb}</span>
        <p className="text-sm text-gray-600 text-left w-[80%]">{status}</p>
      </div>
      <p className="text-sm text-gray-400">({percentage}%)</p>
    </div>
  );
}

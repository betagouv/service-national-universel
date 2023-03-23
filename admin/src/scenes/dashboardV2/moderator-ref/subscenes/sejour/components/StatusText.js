import React from "react";

export default function StatusText({ status, nb, percentage }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg text-gray-900 mr-4">{nb}</span>
        <p className="text-sm text-gray-600 max-w-[180px]">{status}</p>
      </div>
      <p className="text-sm text-gray-400">({percentage}%)</p>
    </div>
  );
}

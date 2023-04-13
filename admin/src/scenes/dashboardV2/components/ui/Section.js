import React from "react";

export default function Section({ title, children, headerChildren = null }) {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-[28px] leading-8 font-bold text-gray-900">{title}</h1>
        {headerChildren && <div>{headerChildren}</div>}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

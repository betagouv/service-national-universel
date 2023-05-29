import React from "react";

export default function Section({ title, children, headerChildren = null }) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">{title}</h1>
        {headerChildren && <div>{headerChildren}</div>}
      </div>
      <div className="">{children}</div>
    </div>
  );
}

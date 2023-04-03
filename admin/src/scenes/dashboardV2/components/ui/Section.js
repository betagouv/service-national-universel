import React from "react";

export default function Section({ title, children }) {
  return (
    <div className="mt-8">
      <h1 className="text-[28px] leading-8 font-bold text-gray-900">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}

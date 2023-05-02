import React from "react";

const EnumeratedList = ({ items, className }) => (
  <ul className={className}>
    {items.map(({ title, description, detail }, i) => (
      <li className="flex" key={i}>
        <span className="mr-4 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-gray-200 pb-[2px] text-sm text-gray-700">{i + 1}</span>
        <div className="mb-4 flex flex-col">
          <div className="mb-1 text-sm font-bold text-gray-900">{title}</div>
          <div className="text-[13px] text-gray-700">{description}</div>
          <div className="text-[13px] italic text-gray-700">{detail}</div>
        </div>
      </li>
    ))}
  </ul>
);

export default EnumeratedList;

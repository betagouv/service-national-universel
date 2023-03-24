import React from "react";

const EnumeratedList = ({ items, className }) => (
  <ul className={className}>
    {items.map(({ title, description, detail }, i) => (
      <li className="flex">
        <span className="flex justify-center items-center border border-gray-200 rounded-full w-[34px] h-[34px] shrink-0 pb-[2px] mr-4 text-sm text-gray-700">{i + 1}</span>
        <div className="flex flex-col mb-4">
          <div className="font-bold text-sm text-gray-900 mb-1">{title}</div>
          <div className="text-[13px] text-gray-700">{description}</div>
          <div className="text-[13px] text-gray-700 italic">{detail}</div>
        </div>
      </li>
    ))}
  </ul>
);

export default EnumeratedList;

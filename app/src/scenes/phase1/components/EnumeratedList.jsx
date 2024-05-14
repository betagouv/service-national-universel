import React from "react";

const EnumeratedList = ({ items, className }) => (
  <ul className={className}>
    {items.map(({ title, description, detail, actions, className }, i) => (
      <li className={`px-2 py-4 flex ${className}`} key={i}>
        <span className="mr-4 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border bg-white border-gray-200 pb-[2px] text-sm text-gray-700">
          {i + 1}
        </span>
        <div>
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-[13px] text-gray-500">{description}</p>
          <p className="text-[13px] italic text-gray-700">{detail}</p>
          {actions}
        </div>
      </li>
    ))}
  </ul>
);

export default EnumeratedList;

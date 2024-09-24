import React from "react";
import { NavLink } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";

interface Props {
  items?: Array<{
    label?: string | React.ReactNode;
    title?: string | React.ReactNode;
    to?: string;
  }>;
}

export default function Breadcrumbs({ items }: Props) {
  if (!items?.length) return null;
  return (
    <div className="flex items-center justify-start mb-2">
      {items.map((item, index) => (
        <div
          key={"breadcrumb-" + String(index)}
          className="flex items-center justify-center"
        >
          <div className="flex text-xs leading-[20px] ">
            {item.to ? (
              <NavLink
                to={item.to}
                className="leading-[20px] whitespace-nowrap text-ds-gray-400 hover:text-ds-gray-400 hover:underline"
              >
                {item.label || item.title}
              </NavLink>
            ) : (
              <div className="leading-[20px] whitespace-nowrap text-ds-gray-500">
                {item.label || item.title}
              </div>
            )}
          </div>
          {index < items.length - 1 ? (
            <HiChevronRight className="text-ds-gray-400 mx-1.5" size={16} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

import React from "react";
import ChevronRight from "../assets/icons/ChevronRight";
import Template from "../assets/icons/Template";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <div className="ml-8 mt-8 flex items-center gap-3 text-gray-400">
      <Link to="/">
        <Template className="hover:scale-105 hover:text-snu-purple-300" />
      </Link>
      {items.map((item) => {
        return (
          <React.Fragment key={item.label}>
            <ChevronRight />
            {item.to ? (
              <Link className="text-xs hover:text-snu-purple-300 hover:underline" to={item.to}>
                {item.label}
              </Link>
            ) : (
              <div className="text-xs">{item.label}</div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

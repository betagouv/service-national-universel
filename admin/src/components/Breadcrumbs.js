import React from "react";
import ChevronRight from "../assets/icons/ChevronRight.js";
import Template from "../assets/icons/Template.js";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <>
      <div className="flex gap-3 text-gray-400 items-center ml-12 mt-8">
        <Link to="/">
          <Template className="hover:text-snu-purple-300 hover:scale-105" />
        </Link>
        {items.map((item) => {
          return (
            <React.Fragment key={item.label}>
              <ChevronRight />
              {item.to ? (
                <Link className="text-xs hover:underline hover:text-snu-purple-300" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <div className="text-xs">{item.label}</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}

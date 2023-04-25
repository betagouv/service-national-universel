import React from "react";
import { Link } from "react-router-dom";
import ChevronRight from "../../assets/icons/ChevronRight";

const MobileMenu = ({ children = null, className = "" }) => {
  return <div className={`flex flex-col gap-3 ${className}`}>{children}</div>;
};

const ItemLink = ({ children = null, className = "", ...rest }) => {
  return (
    <Link
      className={`border-[1px] border-gray-300 rounded-md text-gray-700 font-medium text-sm px-3 py-2 flex justify-between items-center visited:text-gray-700 ${className}`}
      {...rest}>
      {children}
      <ChevronRight className="text-gray-300" />
    </Link>
  );
};

MobileMenu.ItemLink = ItemLink;

export default MobileMenu;

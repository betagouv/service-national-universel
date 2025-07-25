import React from "react";
import { Link } from "react-router-dom";
import ChevronRight from "../../assets/icons/ChevronRight";

const MobileMenu = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`flex flex-col gap-3 ${className}`}>{children}</div>;
};

const ItemLink = ({ children, className, to, ...rest }: { children: React.ReactNode; className?: string; to: string; [key: string]: any }) => {
  return (
    <Link
      className={`flex items-center justify-between rounded-md border-[1px] border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 visited:text-gray-700 ${className}`}
      to={to}
      {...rest}>
      {children}
      <ChevronRight className="text-gray-300" />
    </Link>
  );
};

MobileMenu.ItemLink = ItemLink;

export default MobileMenu;

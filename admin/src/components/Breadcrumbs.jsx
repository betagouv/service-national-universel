import React from "react";
import { Breadcrumbs as BreadcrumbsDS } from "@snu/ds/admin";
import { HiOutlineChartSquareBar } from "react-icons/hi";

export default function Breadcrumbs({ items }) {
  return (
    <div className="ml-8 mt-8 flex items-center gap-3 text-gray-400">
      <BreadcrumbsDS items={[{ title: <HiOutlineChartSquareBar size={20} className="hover:text-gray-500" />, to: "/" }, ...items]} />
    </div>
  );
}

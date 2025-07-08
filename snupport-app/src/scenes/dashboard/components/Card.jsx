import React from "react";
import { classNames } from "../../../utils";
import { arrow } from "../utils";

const Card = ({ icon, title, value, isPositive, percentage, info }) => (
  <div className="flex flex-1 items-center rounded-lg bg-white py-[26px] px-6 shadow">
    <div className="mr-5 flex h-12 w-12 items-center justify-center rounded-md bg-purple-snu text-2xl text-white">{icon}</div>
    <div>
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <div className="flex items-center gap-2">
        <h5 className="text-2xl font-semibold text-gray-900">{value}</h5>
        <div className={classNames(isPositive ? "text-green-500" : "text-red-500", "flex items-center")}>
          <span className="text-base">{arrow(isPositive)}</span>
          <span className="text-sm font-semibold">{percentage}%</span>
        </div>
      </div>
    </div>
    <div className="flex h-full flex-1 items-end justify-end">
      <span className="text-sm font-medium italic text-red-500">{info}</span>
    </div>
  </div>
);

export default Card;

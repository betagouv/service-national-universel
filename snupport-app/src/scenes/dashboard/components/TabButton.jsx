import React from "react";
import { classNames } from "../../../utils";

const TabButton = ({ name, icon, onClick, isActive }) => (
  <button
    className={classNames(
      isActive ? "bg-accent-color text-white" : "bg-white text-black-dark",
      "flex h-14 w-64 items-center justify-center gap-2 transition-colors first:rounded-l-lg last:rounded-r-lg"
    )}
    onClick={onClick}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-sm font-medium capitalize">{name}</span>
  </button>
);
export default TabButton;

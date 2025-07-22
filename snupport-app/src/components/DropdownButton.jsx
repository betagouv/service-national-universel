import { Menu } from "@headlessui/react";
import React from "react";

export default function DropdownButton({ name, className = "", handleClick, isActive }) {
  return (
    <Menu.Item>
      <button
        type="button"
        className={`py-2 px-4 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 ${isActive ? "bg-gray-50" : ""} ${className}`}
        onClick={handleClick}
      >
        {name}
      </button>
    </Menu.Item>
  );
}

import { Menu } from "@headlessui/react";
import React from "react";

export default function DropdownButton({ name, handleClick }) {
  return (
    <Menu.Item>
      <button type="button" className="py-2 px-4 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50" onClick={handleClick}>
        {name}
      </button>
    </Menu.Item>
  );
}

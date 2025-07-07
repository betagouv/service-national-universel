import { Menu, Transition } from "@headlessui/react";
import React from "react";
import { HiChevronDown } from "react-icons/hi";
import { classNames } from "../utils";

const FilterDropdown = ({ icon, name, buttonClass, children, className = "" }) => {
  return (
    <Menu as="div" className={`relative inline-block transition-all ${className}`}>
      {({ open }) => (
        <>
          <Menu.Button className={`flex h-[38px] items-center gap-2.5 border border-gray-300 bg-gray-50 px-4 text-gray-400 ${buttonClass}`}>
            <span className="sr-only">Open options</span>
            <span className="text-xl">{icon}</span>
            <span className={classNames(open ? "text-gray-700" : "text-gray-400", "text-sm font-medium transition-colors")}>{name}</span>
            <HiChevronDown className="text-xl" />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 flex w-56 origin-top-right flex-col rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {children}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default FilterDropdown;

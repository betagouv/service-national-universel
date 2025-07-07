import { Menu, Transition } from "@headlessui/react";
import React from "react";
import { HiCog } from "react-icons/hi";

const ActionButton = ({ actions, disabled }) => {
  return (
    <Menu as="div" className="relative z-20 inline-block transition-all">
      {() => (
        <>
          <Menu.Button disabled={disabled} className="text-xl text-gray-400 transition-colors hover:text-gray-500">
            <HiCog />
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute top-[-60px] right-[20px] z-[100] mt-2 flex w-56 origin-top-right flex-col rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {actions.map(({ label, onClick }) => (
                <Menu.Item key={label}>
                  <button type="button" className={`bg-white py-2 px-4 text-left text-sm text-gray-700 transition-colors  hover:bg-gray-50`} onClick={onClick}>
                    {label}
                  </button>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default ActionButton;

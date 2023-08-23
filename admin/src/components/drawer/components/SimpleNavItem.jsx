import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useRef } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function SimpleNavItem({ sideBarOpen, Icon, title, active, link }) {
  const history = useHistory();
  const buttonRef = useRef(null);
  const timeoutDuration = 200;
  let timeout;

  const closePopover = () => {
    return buttonRef.current?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
  };

  const onMouseEnter = (open) => {
    if (sideBarOpen) return;
    clearTimeout(timeout);
    if (open) return;
    return buttonRef.current?.click();
  };

  const onMouseLeave = (open) => {
    if (sideBarOpen) return;
    if (!open) return;
    timeout = setTimeout(() => closePopover(), timeoutDuration);
  };
  return (
    <Popover className="relative focus:outline-none">
      {({ open }) => {
        return (
          <>
            <div onMouseLeave={onMouseLeave.bind(null, open)}>
              <Popover.Button ref={buttonRef} onMouseEnter={onMouseEnter.bind(null, open)} onMouseLeave={onMouseLeave.bind(null, open)} className="focus:outline-none ">
                <div
                  onClick={() => history.push(link)}
                  className={`group flex items-center py-[10px] pl-[11px] rounded-lg  h-[52px] cursor-pointer 
                   ${sideBarOpen ? "!pr-2  w-[238px]" : "w-[76px]"} ${active ? "bg-[#0C1035]" : "hover:bg-[#1B1F42]"} `}>
                  <div className={`rounded-md w-[3px] h-[20px]  ${active ? "bg-[#EEEFF5]" : "bg-inherit"}`} />
                  <Icon className={`ml-[9px]  w-[30px] h-[30px] text-[#EEEFF5]/70 group-hover:text-[#EEEFF5] ${active && "!text-[#EEEFF5]"}`} />
                  <p
                    className={`truncate flex-1 pl-[15px] w-full text-left text-[#EEEFF5]/80 group-hover:text-[#EEEFF5] ${sideBarOpen ? "block" : "hidden"} ${
                      active && "!text-[#EEEFF5]"
                    }`}>
                    {title}
                  </p>
                </div>
              </Popover.Button>
              {!sideBarOpen && (
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1">
                  <Popover.Panel className="absolute transform left-[100%] bottom-1/2 translate-y-[50%]">
                    <button
                      onClick={() => history.push(link)}
                      className="ml-4 px-4 py-[6px] bg-white shadow-md rounded-lg w-fit z-20"
                      onMouseEnter={onMouseEnter.bind(null, open)}
                      onMouseLeave={onMouseLeave.bind(null, open)}>
                      <p className="text-xs leading-5 font-medium uppercase text-[#3E426A] whitespace-nowrap">{title}</p>
                    </button>
                  </Popover.Panel>
                </Transition>
              )}
            </div>
          </>
        );
      }}
    </Popover>
  );
}

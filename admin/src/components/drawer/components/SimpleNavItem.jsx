import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom/cjs/react-router-dom";

export default function SimpleNavItem({ sideBarOpen, Icon, title, active, link, setCurrentOpen }) {
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const onMouseEnter = () => {
    setPopoverOpen(true);
  };

  const onMouseLeave = () => {
    setPopoverOpen(false);
  };

  return (
    <Popover className="relative focus:outline-none">
      {() => {
        return (
          <>
            <div onMouseLeave={onMouseLeave}>
              <Popover.Button onMouseEnter={onMouseEnter} className="focus:outline-none ">
                <Link
                  to={link}
                  onClick={() => setCurrentOpen("")}
                  className={`group flex items-center py-[10px] pl-[11px] rounded-lg  h-[52px] cursor-pointer 
                   ${sideBarOpen ? "!pr-2  w-[238px]" : "w-[76px]"} ${active ? "bg-[#0C1035]" : "hover:bg-[#1B1F42]"} `}>
                  <div className={`rounded-md w-[3px] h-[20px]  ${active ? "bg-[#EEEFF5]" : "bg-inherit"}`} />
                  <Icon className={`ml-[9px] w-[30px] h-[30px] text-[#EEEFF5]/70 group-hover:text-[#EEEFF5] stroke-[1.5px] ${active && "!text-[#EEEFF5]"}`} />
                  <p
                    className={`truncate flex-1 pl-[15px] text-base w-full text-left text-[#EEEFF5]/80 group-hover:text-[#EEEFF5] ${sideBarOpen ? "block" : "hidden"} ${
                      active && "!text-[#EEEFF5]"
                    }`}>
                    {title}
                  </p>
                </Link>
              </Popover.Button>
              {!sideBarOpen && (
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                  show={isPopoverOpen}
                  onEnter={() => setPopoverOpen(true)}
                  onExited={() => setPopoverOpen(false)}>
                  <Popover.Panel className="absolute transform left-[100%] bottom-1/2 translate-y-[50%]">
                    <div className="!ml-[14px] px-4 py-[6px] bg-white shadow-md rounded-lg w-fit z-20">
                      <Link to={link} onClick={() => setCurrentOpen("")} className="flex items-center w-full ">
                        <p className="text-xs leading-5 font-medium uppercase text-[#3E426A] whitespace-nowrap">{title}</p>
                      </Link>
                    </div>
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

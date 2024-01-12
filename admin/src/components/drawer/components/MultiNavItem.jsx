import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { BsDot } from "react-icons/bs";
import { HiChevronDown } from "react-icons/hi";
import { Link } from "react-router-dom";
import Separator from "./Separator";

export default function MultiNavItem({ sideBarOpen, Icon, items, path, title, currentOpen, setCurrentOpen }) {
  const dropDownOpen = currentOpen === title;
  const navActive = items.some((item) => item.link.split("/")[1] === path) && (!dropDownOpen || !sideBarOpen);
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const onMouseEnter = () => {
    setPopoverOpen(true);
  };

  const onMouseLeave = () => {
    setPopoverOpen(false);
  };

  return (
    <>
      <Popover className="relative focus:outline-none">
        {() => {
          return (
            <>
              <div onMouseLeave={onMouseLeave}>
                <Popover.Button onMouseEnter={onMouseEnter} className="focus:outline-none ">
                  <div
                    onClick={() => (currentOpen === title ? setCurrentOpen("") : setCurrentOpen(title))}
                    className={`group flex items-center py-[10px] pl-[11px] rounded-lg  h-[52px] cursor-pointer 
                   ${sideBarOpen ? "!pr-2  w-[238px]" : "w-[76px]"} ${navActive ? "bg-[#0C1035]" : "hover:bg-[#1B1F42]"}`}>
                    <div className={`rounded-md w-[3px] h-[20px]  ${navActive ? "bg-[#EEEFF5]" : "bg-inherit"}`} />
                    <Icon className={`ml-[9px]  w-[30px] h-[30px] text-[#EEEFF5]/70 group-hover:text-[#EEEFF5] ${navActive && "!text-[#EEEFF5]"}`} />
                    <p
                      className={`truncate text-base flex-1 pl-[15px] w-full text-left text-[#EEEFF5]/80 group-hover:text-[#EEEFF5] ${sideBarOpen ? "block" : "hidden"} ${
                        navActive && "!text-[#EEEFF5]"
                      }`}>
                      {title}
                    </p>
                    {sideBarOpen && (
                      <HiChevronDown
                        className={`ml-2 text-[#EEEFF5]/50  ${navActive ? "text-[#EEEFF5]/80" : "group-hover:text-[#EEEFF5]/70"}  w-5 h-5 ${dropDownOpen && "rotate-180"}`}
                      />
                    )}
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
                    leaveTo="opacity-0 translate-y-1"
                    show={isPopoverOpen}
                    onEnter={() => setPopoverOpen(true)}
                    onExited={() => setPopoverOpen(false)}>
                    <Popover.Panel className="absolute transform left-[100%] bottom-1/2 translate-y-[50%] ">
                      <div className="!ml-[14px] px-[3px] py-[3px] bg-white shadow-md rounded-lg w-[225px] z-20">
                        <p className="pl-6 pt-2 pr-2 pb-[2px] h-[30px] text-xs leading-5 font-medium uppercase text-[#3E426A] whitespace-nowrap">{title}</p>
                        <div className="flex flex-col py-[6px]">
                          {items.map((item) => {
                            const active = item.link.split("/")[1] === path;
                            return (
                              <Link
                                key={item.link}
                                to={item.link}
                                className={`group flex items-center pl-[1px] pr-[8px] py-[7px] h-[34px] rounded-md ${active ? "bg-[#EEEFF5]" : "hover:bg-[#EEEFF5]"}`}>
                                <div className="w-[22px] h-[22px] flex items-center justify-center">
                                  <BsDot className={`ml-2 text-[#7F83A7] ${active ? "!w-6 !h-6 text-[#30345B]" : "!w-3 !h-3 hover:text-[#30345B]"}`} />
                                </div>
                                <p className={`pl-2 text-sm leading-5 text-[#3E426A] ${active ? "text-[#1B1F42] font-medium" : "group-hover:text-[#1B1F42]"}`}>{item.title}</p>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                )}
              </div>
            </>
          );
        }}
      </Popover>
      {sideBarOpen && (
        <div className={`flex-col ${dropDownOpen ? "flex" : "hidden"}`}>
          <Separator />
          <div className="flex flex-col py-[6px] overflow-auto max-h-[300px]">
            {items.map((item) => {
              const actif = item.link.split("/")[1] === path;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`group flex items-center pl-[20px] pr-[6px] py-[6px] h-9 text-[#D0D2E2] rounded-md ${actif ? "bg-[#0C1035]" : "hover:bg-[#1B1F42]"}`}>
                  <div className="!w-6 !h-6 flex items-center justify-center">
                    <BsDot className={`ml-2 text-[#B3B5CD] ${actif ? "!w-4 !h-4 text-[#D0D2E2]" : "!w-3 !h-3 hover:text-[#B3B5CD]"}`} />
                  </div>
                  <p className={`pl-2 text-sm leading-5 text-[#D0D2E2]/80 ${actif ? "text-[#EEEFF5]" : "group-hover:text-[#EEEFF5]"}`}>{item.title}</p>
                </Link>
              );
            })}
          </div>
          <Separator />
        </div>
      )}
    </>
  );
}

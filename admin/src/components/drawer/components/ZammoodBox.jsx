import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { toastr } from "react-redux-toastr";
import api from "@/services/api";
import { translate } from "@/utils";
import Mail from "../icons/Mail";
import Separator from "./Separator";

export default function ZammoodBox({ newTickets, openedTickets, sideBarOpen }) {
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const onMouseEnter = () => {
    setPopoverOpen(true);
  };

  const onMouseLeave = () => {
    setPopoverOpen(false);
  };

  const connectToZammood = async () => {
    try {
      const { ok, data, code } = await api.get(`/zammood/signin`);
      if (!ok) return toastr.error("Oups, une erreur est survenue. Veuillez contacter le support", translate(code));
      window.open(data, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.log(e);
      toastr.error(e.message, translate(e.code));
    }
  };

  const containerStyle0 = "bg-[#0C103566]/40 border-[#7F83A7]";
  const textStyle0 = "text-[#7F83A7]";

  return (
    <div className="">
      <Popover className="relative focus:outline-none">
        {() => {
          return (
            <>
              <div onMouseLeave={onMouseLeave}>
                <Popover.Button onMouseEnter={onMouseEnter} className="focus:outline-none ">
                  <div
                    onClick={connectToZammood}
                    className={`group flex items-center h-[66px] pl-[29px] py-[18px] !pr-3 hover:bg-[#1B1F42]  ${sideBarOpen ? "!pr-2  w-[250px]" : "w-[88px]"}`}>
                    <Mail className={`w-[30px] h-[30px] text-[#EEEFF5]/70 group-hover:text-[#EEEFF5]`} />
                    {sideBarOpen && (
                      <div className="flex items-center pl-[16px] justify-start gap-2">
                        <Badge
                          count={newTickets}
                          containerStyle={newTickets !== 0 ? "bg-red-900/40 border-red-400 group-hover:bg-red-500/80 group-hover:border-white" : containerStyle0}
                          textStyle={newTickets !== 0 ? "text-red-400 group-hover:text-white" : textStyle0}
                        />
                        <Badge
                          count={openedTickets}
                          containerStyle={openedTickets !== 0 ? "bg-yellow-900/40 border-yellow-400 group-hover:bg-yellow-500/80 group-hover:border-white" : containerStyle0}
                          textStyle={openedTickets !== 0 ? "text-yellow-400 group-hover:text-white" : textStyle0}
                        />
                      </div>
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
                    <Popover.Panel className="absolute transform left-[100%] bottom-1/2 translate-y-[50%]">
                      <button onClick={connectToZammood} className="!ml-2 px-4 py-[6px] bg-white shadow-md rounded-lg w-fit z-20">
                        <p className="text-xs leading-5 font-medium uppercase text-[#3E426A] whitespace-nowrap">Boîte de reception</p>
                      </button>
                    </Popover.Panel>
                  </Transition>
                )}
              </div>
            </>
          );
        }}
      </Popover>
      <Separator open={sideBarOpen} />
    </div>
  );
}

const Badge = ({ count, containerStyle, textStyle }) => {
  return (
    <div className={`flex items-center justify-center !h-6 rounded-xl py-[4px] px-[10px] border-[1px]  ${containerStyle}`}>
      <span className={`align-middle ${textStyle} text-[13px]`}>{count}</span>
    </div>
  );
};

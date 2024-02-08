import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { setSessionPhase1 } from "../../../redux/auth/actions";
import Check from "../icons/Check";
import Selector from "../icons/Selector";
import Switch from "../icons/Switch";
import Separator from "./Separator";

export default function SwitchSession({ sideBarOpen, sessionsList, sessionPhase1 }) {
  const dispatch = useDispatch();
  const history = useHistory();

  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const onMouseEnter = () => {
    setPopoverOpen(true);
  };

  const onMouseLeave = () => {
    setPopoverOpen(false);
  };

  const changeSession = (session) => {
    dispatch(setSessionPhase1(session));
    setPopoverOpen(false);
    localStorage?.setItem("active_session_chef_de_centre", JSON.stringify(session));
    // on retourne au dashboard !
    history.push("/");
  };

  if (!sessionPhase1 || !sessionsList?.length) return null;

  return (
    <div>
      <Popover className="relative focus:outline-none">
        {() => {
          return (
            <>
              <div onMouseLeave={onMouseLeave}>
                <Popover.Button onMouseEnter={onMouseEnter} className="focus:outline-none">
                  <div
                    onClick={() => {}}
                    className={`group flex items-center ${sideBarOpen ? "h-[66px] pl-[20px] py-[15px] pr-[10px]" : "py-[23px] px-[34px]"} hover:bg-[#1B1F42] ${
                      sideBarOpen ? "w-[250px]" : "w-[88px]"
                    }`}>
                    {sideBarOpen && (
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-sm text-left leading-5 font-bold h-[20px] text-[#EEEFF5]">{sessionPhase1?.cohort}</span>
                        <span className="text-xs text-left leading-none !h-3 truncate text-[#EEEFF5]">{sessionPhase1?.cohesionCenter?.name || "Mon espace chef de centre"}</span>
                      </div>
                    )}
                    <div className={`${sideBarOpen && "pl-[6px]"} flex items-center justify-center`}>
                      <Selector className={`text-[#EEEFF5]/50 group-hover:text-[#EEEFF5]/70`} />
                    </div>
                  </div>
                </Popover.Button>
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
                  <Popover.Panel className="absolute transform left-[100%] top-0 ">
                    <div className="!ml-2 px-[1px] py-[1px] bg-white shadow-md rounded-lg w-[275px] z-20">
                      {sessionsList?.map((session, i) => {
                        const active = session?.cohort === sessionPhase1?.cohort;
                        const isLast = i === sessionsList.length - 1;
                        const isFirst = i === 0;
                        return (
                          <div key={"change-session" + session?.cohort}>
                            <button
                              className={`group flex items-center h-[62px] py-[14px] pl-[15px] pr-[13px] w-full hover:bg-[#EEEFF5] ${isFirst && "rounded-t-md"} ${
                                isLast && "rounded-b-md"
                              }`}
                              onClick={() => changeSession(session)}>
                              {active ? <Check className="text-green-500" /> : <Switch className="text-[#30345B]" />}
                              <div className="flex flex-col ml-[9px] gap-[2px] flex-1">
                                <span className={`h-[20px] text-left text-sm text-[#1B1F42] leading-5 ${active && "font-bold"}`}>{session.cohort}</span>
                                <span className={`h-[12px] text-left text-xs text-[#7F83A7] leading-none ${active && "font-medium"}`}>{session.cohesionCenter?.name}</span>
                              </div>
                            </button>
                            {!isLast && <div className="bg-gray-100 h-[1px] mx-auto w-[247px]" />}
                          </div>
                        );
                      })}
                    </div>
                  </Popover.Panel>
                </Transition>
              </div>
            </>
          );
        }}
      </Popover>
      <Separator open={sideBarOpen} />
    </div>
  );
}

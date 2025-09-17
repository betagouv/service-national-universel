import React from "react";
import cx from "classnames";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

import useEnvironment from "@/hooks/useEnvironment";
import logo_snu from "@/assets/logo-snu.png";

import Separator from "./Separator";

interface HeaderProps {
  open?: boolean;
  setOpen?: (isOpen: boolean) => void;
  onDemoChange: () => void;
}

export default function Header({ open, setOpen, onDemoChange }: HeaderProps) {
  const { isProduction } = useEnvironment();

  //save the current state of the sidebar in the local storage
  const onChangeOpen = () => {
    localStorage?.setItem("sideBarOpen", String(!open));
    window.dispatchEvent(
      new CustomEvent("sideBar", {
        detail: { open: !open },
      }),
    );

    setOpen?.(!open);
  };
  return (
    <>
      <button className={`group relative flex flex-row h-[116px] !pt-8 !pb-7 !pl-4 hover:bg-[#1B1F42] items-center ${open && "!pr-2"}`} onClick={onChangeOpen}>
        {!isProduction && <TestBadge open={open} onDemoChange={onDemoChange} />}
        <img className={cx("w-[56px] h-[56px]", { "saturate-50": !isProduction })} src={logo_snu} alt="logo_snu" id="logo_snu" />
        {open && (
          <p className="ml-3 text-white uppercase text-sm font-medium text-left leading-[17px] w-full">
            Service <br /> National
            <br /> Universel
          </p>
        )}
        {open ? <HiChevronLeft className="hidden group-hover:block ml-1 text-[#EEEFF5] w-8 h-8" /> : <HiChevronRight className="hidden group-hover:block text-[#EEEFF5] w-6 h-6" />}
      </button>
      <Separator open={open} />
    </>
  );
}

const TestBadge = ({ open, onDemoChange }: { open?: boolean; onDemoChange: () => void }) => {
  const { isDevelopment } = useEnvironment();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDemoChange();
      }}
      className={cx("absolute top-[5px] h-[18px] border-[1px] border-white rounded-full flex justify-center items-center px-1", {
        "right-[10px]": open,
        "right-1/2 transform translate-x-1/2": !open,
        "bg-red-500": !isDevelopment,
        "bg-blue-500": isDevelopment,
      })}>
      <div className="leading-none uppercase text-[10px] text-white">
        {isDevelopment && "DEV"}
        {!isDevelopment && "TEST"}
      </div>
    </button>
  );
};

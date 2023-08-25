import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import logo_snu from "../../../assets/logo-snu.png";
import Separator from "./Separator";

export default function Header({ open, setOpen }) {
  //save the current state of the sidebar in the local storage
  const onChangeOpen = () => {
    localStorage?.setItem("sideBarOpen", !open);
    setOpen(!open);
  };
  return (
    <>
      <button className={`group flex flex-row h-[116px] !pt-8 !pb-7 !pl-4 hover:bg-[#1B1F42] items-center ${open && "!pr-2"}`} onClick={onChangeOpen}>
        <img className="w-[56px] h-[56px]" src={logo_snu} alt="logo_snu" />
        {open ? (
          <p className="ml-3 text-white uppercase text-sm font-medium text-left leading-[17px] w-full">
            Service <br /> National
            <br /> Universel
          </p>
        ) : null}
        {open ? <HiChevronLeft className="hidden group-hover:block ml-1 text-[#EEEFF5] w-8 h-8" /> : <HiChevronRight className="hidden group-hover:block text-[#EEEFF5] w-6 h-6" />}
      </button>
      <Separator open={open} />
    </>
  );
}

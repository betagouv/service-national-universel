import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import logo_snu from "../../../assets/logo-snu.png";
import Separator from "./Separator";
import { environment } from "../../../config";

export default function Header({ open, setOpen }) {
  //save the current state of the sidebar in the local storage
  const onChangeOpen = () => {
    localStorage?.setItem("sideBarOpen", !open);
    setOpen(!open);
  };
  return (
    <>
      <button className={`group relative flex flex-row h-[116px] !pt-8 !pb-7 !pl-4 hover:bg-[#1B1F42] items-center ${open && "!pr-2"}`} onClick={onChangeOpen}>
        <Badge open={open} />
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

const Badge = ({ open }) => {
  if (environment === "production") return <></>;
  return (
    <div
      className={`absolute top-[5px] ${open ? "right-[10px]" : "right-1/2 transform translate-x-1/2"} h-[18px] border-[1px] ${
        environment === "development" ? "bg-blue-500" : "bg-red-500"
      } border-white rounded-full text-white text-[10px] align-middle px-1 uppercase`}>
      {environment === "development" ? "Dev" : "Test"}
    </div>
  );
};

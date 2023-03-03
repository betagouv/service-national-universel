import React from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import User from "./components/User";
import LogoSNU from "./assets/logoSNU.svg";

export default function Navbar() {
  return (
    <div className="bg-[#212B44] text-[#D2DAEF] text-sm md:w-64 flex-none h-fit md:h-screen sticky top-0 z-50 overscroll-none flex justify-between md:justify-start md:flex-col items-center">
      <Header />
      <Menu />
      <img src={LogoSNU} alt="logo" className="w-26 h-11 block md:hidden" />
      <User />
    </div>
  );
}

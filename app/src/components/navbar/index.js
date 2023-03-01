import React from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import User from "./components/User";

export default function Navbar() {
  return (
    <div className="bg-[#212B44] text-[#D2DAEF] text-sm h-fit">
      <div className="flex md:hidden">Mobile navbar</div>
      <div className="hidden md:block w-64">
        <Header />
        <Menu />
        <User />
      </div>
    </div>
  );
}

import React from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import UserCard from "./components/UserCard";

export default function Navbar() {
  return (
    <div className="bg-[#212B44] text-[#D2DAEF] text-sm h-fit">
      <div className="flex md:hidden">Mobile navbar</div>
      <div className="hidden md:block w-64">
        <Header />
        <Menu />
        <UserCard />
      </div>
    </div>
  );
}

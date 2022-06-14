import React from "react";
import HomeDesktop from "./components/HomeDesktop";
import HomeMobile from "./components/HomeMobile";

export default function View() {
  return (
    <>
      <div className="hidden md:flex flex-1">
        <HomeDesktop />
      </div>
      <div className="flex md:hidden ">
        <HomeMobile />
      </div>
    </>
  );
}

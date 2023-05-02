import React from "react";
import HomeDesktop from "./HomeDesktop";
import HomeMobile from "./HomeMobile";

export default function View() {
  return (
    <>
      <div className="hidden flex-1 md:flex">
        <HomeDesktop />
      </div>
      <div className="flex md:hidden ">
        <HomeMobile />
      </div>
    </>
  );
}

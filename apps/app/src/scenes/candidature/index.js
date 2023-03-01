import React from "react";
import InProgressDesktop from "./desktop";
import InProgressMobile from "./mobile";

export default function View() {
  return (
    <>
      <div className="hidden md:flex flex-1">
        <InProgressDesktop />
      </div>
      <div className="flex md:hidden ">
        <InProgressMobile />
      </div>
    </>
  );
}

import React from "react";
import InProgressDesktop from "./desktop";
import InProgressMobile from "./mobile";

export default function View() {
  return (
    <>
      <div className="hidden flex-1 md:flex">
        <InProgressDesktop />
      </div>
      <div className="flex md:hidden ">
        <InProgressMobile />
      </div>
    </>
  );
}

import React from "react";
import InProgressDesktop from "./desktop";
import InProgressMobile from "./mobile";

export default function View() {
  return (
    <>
      <div className="hidden flex-1 md:flex">
        <h1 className="mt-6 mx-auto text-center font-bold text-4xl md:text-5xl max-w-xl leading-tight md:leading-tight">Mes engagements</h1>
        <InProgressDesktop />
      </div>
      <div className="flex md:hidden ">
        <InProgressMobile />
      </div>
    </>
  );
}

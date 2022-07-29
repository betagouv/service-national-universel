import React from "react";
import DesktopView from "./desktop";
import MobileView from "./mobile";

export default function View() {
  return (
    <>
      <div className="hidden md:flex flex-1">
        <DesktopView />
      </div>
      <div className="flex md:hidden w-screen">
        <MobileView />
      </div>
    </>
  );
}

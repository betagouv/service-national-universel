import React from "react";
import tailwind from "../../tailwind.config";

export default function useMobileSwitch(MobileComp, DesktopComp) {
  if (window.innerWidth <= parseInt(tailwind.theme.screens.md))
    return (
      <div className="flex w-screen">
        <MobileComp />
      </div>
    );
  return (
    <div className="flex flex-1">
      <DesktopComp />
    </div>
  );
}

import React from "react";
import { useWindowSize } from "usehooks-ts";
import tailwindConfig from "../../../../tailwind.config";
import DesktopView from "./desktop";
import MobileView from "./mobile";

export default function View() {
  console.log("md:", parseInt(tailwindConfig.theme.screens.md));
  const { width } = useWindowSize();
  const isDesktop = width > parseInt(tailwindConfig.theme.screens.md);
  console.log("isDesktop:", isDesktop);

  return (
    <>
      {isDesktop ? (
        <div className="md:flex flex-1">
          <DesktopView />
        </div>
      ) : (
        <div className="flex w-screen">
          <MobileView />
        </div>
      )}
    </>
  );
}

import React from "react";
import useDevice from "../../../hooks/useDevice";
import DesktopView from "./desktop";
import MobileView from "./mobile";

export default function View() {
  const device = useDevice();

  if (device === "desktop") return <DesktopView />;
  else return <MobileView />;
}

import React, { useEffect, useState } from "react";
import DesktopView from "./desktop";
import MobileView from "./mobile";

export default function View() {
  const [isDesktop, setDesktop] = useState(window.innerWidth > 650);

  function updateMedia() {
    setDesktop(window.innerWidth > 650);
  }

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  return <>{isDesktop ? <DesktopView /> : <MobileView />}</>;
}

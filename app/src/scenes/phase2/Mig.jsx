import React from "react";
import DesktopView from "./desktop";
import MobileView from "./mobile";
import { useSelector } from "react-redux";
import Validated from "./Validated";

import { YOUNG_STATUS_PHASE2 } from "../../utils";

export default function View() {
  const young = useSelector((state) => state.Auth.young);

  if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) return <Validated></Validated>;

  return (
    <>
      <div className="hidden flex-1 md:flex">
        <DesktopView young={young} />
      </div>
      <div className="flex md:hidden ">
        <MobileView young={young} />
      </div>
    </>
  );
}

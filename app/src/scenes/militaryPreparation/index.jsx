import React from "react";
import { useHistory } from "react-router-dom";
import HomeDesktop from "./HomeDesktop";
import HomeMobile from "./HomeMobile";
import usePermissions from "@/hooks/usePermissions";

export default function View() {
  const { canViewMissions } = usePermissions();
  const history = useHistory();

  if (!canViewMissions) {
    history.push("/phase2");
    return null;
  }

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

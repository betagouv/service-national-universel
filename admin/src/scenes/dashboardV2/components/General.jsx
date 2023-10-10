import React from "react";
import { ROLES } from "snu-lib";
import { useSelector } from "react-redux";
import DashboardContainer from "./DashboardContainer";
import KeyNumbers from "./KeyNumbers";
import InfoMessage from "./ui/InfoMessage";
import Todos from "./Todos";
import Objective from "../moderator-ref/subscenes/general/components/Objective";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);

  const availableTab = (() => {
    switch (user.role) {
      case ROLES.HEAD_CENTER:
        return ["general", "sejour"];
      case ROLES.RESPONSIBLE:
      case ROLES.SUPERVISOR:
        return ["general", "engagement"];
      default:
        return ["general", "engagement", "sejour", "inscription"];
    }
  })();
  return (
    <DashboardContainer active="general" availableTab={availableTab}>
      <div className="flex flex-col gap-8 mb-4">
        <InfoMessage />
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">En ce moment</h1>
        <div className="flex w-full gap-4">
          <Todos user={user} />
          {user.role !== ROLES.HEAD_CENTER && <KeyNumbers />}
        </div>
        {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) && <Objective user={user} />}
      </div>
    </DashboardContainer>
  );
}

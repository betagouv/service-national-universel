import React from "react";
import { canCreateMission } from "snu-lib";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

export function ActionButton() {
  //@ts-expect-error Auth does not exist
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

  if (!canCreateMission(user)) {
    return null;
  }

  return (
    <div className="flex items-center justify-end">
      <button className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-white" onClick={() => history.push(`/mission/create/${user.structureId}`)}>
        Nouvelle mission
      </button>
    </div>
  );
}

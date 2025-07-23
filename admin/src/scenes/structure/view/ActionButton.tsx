import React from "react";
import { isCreateAuthorized, PERMISSION_RESOURCES } from "snu-lib";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

export function ActionButton({ structureRattacheeId, networkId }: { structureRattacheeId?: string; networkId?: string }) {
  //@ts-expect-error Auth does not exist
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

  if (!isCreateAuthorized({ user, resource: PERMISSION_RESOURCES.MISSION, context: { structure: { _id: structureRattacheeId!, networkId: networkId! } } })) {
    return null;
  }
  let structureRattacheeParam = "";
  if (typeof structureRattacheeId === "string" && structureRattacheeId !== user.structureId) {
    structureRattacheeParam = `?structureRattacheeId=${structureRattacheeId}`;
  }

  return (
    <div className="flex items-center justify-end">
      <button className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-white" onClick={() => history.push(`/mission/create/${user.structureId}${structureRattacheeParam}`)}>
        Nouvelle mission
      </button>
    </div>
  );
}

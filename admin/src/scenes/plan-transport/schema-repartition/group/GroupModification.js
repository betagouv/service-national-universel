import React from "react";
import { GroupBox, GroupHeader, GroupMenuItem, GroupSummary } from "../../components/commons";
import { GROUPSTEPS } from "../../util";

export default function GroupModification({ group, className = "", onChangeStep }) {
  return (
    <GroupBox className={className}>
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.CANCEL)}>Modifier un groupe</GroupHeader>
      <GroupSummary group={group} className="justify-end" />
      <div className="mt-[20px] border-t-[1px] border-t-[#E5E7EB]">
        <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.YOUNG_COUNTS)}>Modifier le nombre de volontaires</GroupMenuItem>
        {group.centerId ? (
          <>
            <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CENTER)}>Modifier l&apos;affectation</GroupMenuItem>
            <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CONFIRM_DELETE_CENTER)}>Passer en attente d&apos;affectation</GroupMenuItem>
          </>
        ) : (
          <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CENTER)}>Affecter les volontaires</GroupMenuItem>
        )}
        {group.gatheringPlaces && group.gatheringPlaces.length > 0 && (
          <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.GATHERING_PLACES)}>Modifier les lieux de rassemblements</GroupMenuItem>
        )}
        <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CONFIRM_DELETE_GROUP)}>Supprimer le groupe</GroupMenuItem>
      </div>
    </GroupBox>
  );
}

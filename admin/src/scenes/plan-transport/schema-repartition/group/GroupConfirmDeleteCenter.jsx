import React from "react";
import { GroupBox, GroupHeader, GroupSummary } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import { BorderButton, PlainButton } from "../../components/Buttons";

export default function GroupConfirmDeleteCenter({ group, className = "", onChange, onChangeStep }) {
  function onDelete() {
    onChange({
      ...group,
      centerId: null,
      centerName: null,
      centerCity: null,
      sessionId: null,
      toDepartment: null,
      toRegion: null,
      gatheringPlaces: [],
    });
  }

  return (
    <GroupBox className={className}>
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.MODIFICATION)}>Passer en attente d&apos;affectation</GroupHeader>
      <GroupSummary group={group} className="justify-end" />
      <div className="mt-[20px] border-y-[1px] border-y-[#E5E7EB] px-[16px] py-[30px]">
        Souhaitez-vous vraiment supprimer l&apos;affectation de ce groupe et le repasser en attente d&apos;affectation&nbsp;?
      </div>
      <div className="flex items-end justify-center pt-[67px]">
        <BorderButton onClick={() => onChangeStep(GROUPSTEPS.MODIFICATION)} className="mr-[8px]">
          Annuler
        </BorderButton>
        <PlainButton onClick={onDelete}>Confirmer la suppression</PlainButton>
      </div>
    </GroupBox>
  );
}

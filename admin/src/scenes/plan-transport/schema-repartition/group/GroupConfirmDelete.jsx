import React from "react";
import { GroupBox, GroupHeader, GroupSummary } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import { BorderButton, PlainButton } from "../../components/Buttons";

export default function GroupConfirmDelete({ group, className = "", onDelete, onChangeStep }) {
  return (
    <GroupBox className={className}>
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.MODIFICATION)}>Suprimer le groupe</GroupHeader>
      <GroupSummary group={group} className="justify-end" />
      <div className="mt-[20px] border-y-[1px] border-y-[#E5E7EB] px-[16px] py-[30px]">Souhaitez-vous vraiment supprimer ce groupe d&apos;affectation ?</div>
      <div className="flex items-end justify-center pt-[67px]">
        <BorderButton onClick={() => onChangeStep(GROUPSTEPS.MODIFICATION)} className="mr-[8px]">
          Annuler
        </BorderButton>
        <PlainButton onClick={() => onDelete(group)}>Confirmer la suppression</PlainButton>
      </div>
    </GroupBox>
  );
}

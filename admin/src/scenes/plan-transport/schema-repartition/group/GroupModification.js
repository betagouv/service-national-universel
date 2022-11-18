import React from "react";
import { GroupBox, GroupHeader, GroupSummary } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import ChevronRight from "../../../../assets/icons/ChevronRight";

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
        <GroupMenuItem onClick={() => onChangeStep(GROUPSTEPS.CONFIRM_DELETE_GROUP)}>Supprimer le groupe</GroupMenuItem>
      </div>
    </GroupBox>
  );
}

function GroupMenuItem({ children, onClick }) {
  return (
    <div
      className="flex items-center justify-between px-[16px] py-[30px] border-b-[1px] border-b-[#E5E7EB] text-[#1F2937] hover:text-[#1F2937] hover:bg-[#E5E7EB] cursor-pointer"
      onClick={onClick}>
      <div className="text-[15px] leading-[18px] font-bold">{children}</div>
      <ChevronRight className="text-[#9CA3AF]" />
    </div>
  );
}

import React from "react";
import People from "../../../assets/icons/People";
import Plus from "../../../assets/icons/Plus";
import { GroupSummary } from "../components/commons";
import { getDepartmentNumber } from "snu-lib";

export default function GroupSelector({
  title,
  groups,
  youngsCount,
  intradepartmental,
  className = "",
  onSelect,
  cohort: cohortName,
  department,
  region,
  selectedGroup,
  isUserAuthorizedToCreateGroup,
}) {
  function createGroup() {
    onSelect({
      cohort: cohortName,
      intradepartmental: intradepartmental ? "true" : "false",
      fromDepartment: department,
      fromRegion: region,
      toDepartment: null,
      toRegion: null,
      centerId: null,
      centerName: null,
      centerCity: null,
      sessionId: null,
      youngsVolume: 0,
      availableVolume: youngsCount,
      gatheringPlaces: [],
    });
  }

  function onSelectGroup(group) {
    onSelect && onSelect({ ...group, availableVolume: youngsCount });
  }

  return (
    <div className={className}>
      <div className="mb-[8px] flex items-center justify-between rounded-[8px] bg-[#F7F7F8] p-[32px]">
        <div className="flex items-center">
          <div className="text-[15px] font-bold leading-[18px] text-[#111827]">{title}</div>
          {intradepartmental && <div className="ml-[10px] rounded-full bg-[#6366F1] py-[1px] px-[10px] text-[11px] text-[#FFFFFF]">Intra-départemental</div>}
        </div>
        <div className="flex items-center">
          <People className="mr-[5px] text-[#9CA3AF]" />
          <span className="text-[17px] font-bold leading-[21px] text-[#111827]">{youngsCount}</span>
        </div>
      </div>
      <div className="relative grid grid-cols-2">
        {groups.map((group) => (
          <GroupBox key={group._id} group={group} onSelect={onSelectGroup} selected={selectedGroup && selectedGroup._id === group._id} />
        ))}
        {isUserAuthorizedToCreateGroup && (
          <div className="p-[8px]">
            <div className="flex-column flex items-center justify-center rounded-[8px] border-[1px] border-dashed border-[#D1D5DB] py-[45px]">
              <div
                className="hover:border[#2563EB] flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full border-[1px] border-[transparent] bg-[#2563EB] text-[#FFFFFF] shadow-[0px_1px_10px_rgba(24,59,245,0.21)] hover:bg-[#FFFFFF] hover:text-[#2563EB]"
                onClick={createGroup}>
                <Plus width={12} height={12} />
              </div>
              <div className="text-[13px] leading-[16px] text-[#374151]">Créer un groupe</div>
            </div>
          </div>
        )}
        <div className="clear-both" />
      </div>
    </div>
  );
}

function GroupBox({ group, className = "", onSelect, selected }) {
  return (
    <div className={`p-[8px] ${className}`}>
      <div
        className={`rounded-[8px] border-[1px] border-[#E5E7EB] bg-[#FFFFFF] p-[20px] ${
          selected ? "shadow-[0px_5px_24px_rgba(0,0,0,0.15)]" : ""
        } cursor-pointer hover:shadow-[0px_5px_24px_rgba(0,0,0,0.15)]`}
        onClick={() => onSelect(group)}>
        <GroupSummary group={group} className="justify-between" />
        <div className={`mt-[24px] ${group.centerId ? "" : "opacity-30"}`}>
          <div className="text-[15px] font-bold leading-[18px] text-[#374151]">{group.cohesionCenter ? group.cohesionCenter.name : "Centre d'affectation"}</div>
          <div className="mt-[8px] text-[15px] leading-[18px] text-[#6B7280]">
            {group.cohesionCenter ? group.cohesionCenter.city : "Ville"} •{" "}
            {group.toDepartment ? `${group.toDepartment} (${getDepartmentNumber(group.toDepartment)})` : "Département"}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import People from "../../../assets/icons/People";
import Plus from "../../../assets/icons/Plus";
import { GroupSummary } from "../components/commons";

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
      <div className="flex items-center justify-between bg-[#F7F7F8] p-[32px] mb-[8px] rounded-[8px]">
        <div className="flex items-center">
          <div className="text-[#111827] text-[15px] leading-[18px] font-bold">{title}</div>
          {intradepartmental && <div className="text-[#FFFFFF] text-[11px] py-[1px] px-[10px] bg-[#6366F1] rounded-full ml-[10px]">Intra-départemental</div>}
        </div>
        <div className="flex items-center">
          <People className="text-[#9CA3AF] mr-[5px]" />
          <span className="text-[#111827] text-[17px] leading-[21px] font-bold">{youngsCount}</span>
        </div>
      </div>
      <div className="relative grid grid-cols-2">
        {groups.map((group) => (
          <GroupBox key={group._id} group={group} onSelect={onSelectGroup} selected={selectedGroup && selectedGroup._id === group._id} />
        ))}
        {isUserAuthorizedToCreateGroup && (
          <div className="p-[8px]">
            <div className="border-[1px] border-dashed border-[#D1D5DB] rounded-[8px] flex flex-column items-center justify-center py-[45px]">
              <div
                className="bg-[#2563EB] rounded-full shadow-[0px_1px_10px_rgba(24,59,245,0.21)] w-[32px] h-[32px] flex items-center justify-center text-[#FFFFFF] border-[transparent] border-[1px] hover:bg-[#FFFFFF] hover:border[#2563EB] hover:text-[#2563EB] cursor-pointer"
                onClick={createGroup}>
                <Plus width={12} height={12} />
              </div>
              <div className="text-[#374151] text-[13px] leading-[16px]">Créer un groupe</div>
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
        className={`p-[20px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#E5E7EB] ${
          selected ? "shadow-[0px_5px_24px_rgba(0,0,0,0.15)]" : ""
        } hover:shadow-[0px_5px_24px_rgba(0,0,0,0.15)] cursor-pointer`}
        onClick={() => onSelect(group)}>
        <GroupSummary group={group} className="justify-between" />
        <div className={`mt-[24px] ${group.centerId ? "" : "opacity-30"}`}>
          <div className="text-[15px] leading-[18px] text-[#374151] font-bold">{group.centerName ? group.centerName : "Centre d'affectation"}</div>
          <div className="text-[15px] leading-[18px] text-[#6B7280] mt-[8px]">
            {group.centerCity ? group.centerCity : "Ville"} • {group.toDepartment ? group.toDepartment : "Département"}
          </div>
        </div>
      </div>
    </div>
  );
}

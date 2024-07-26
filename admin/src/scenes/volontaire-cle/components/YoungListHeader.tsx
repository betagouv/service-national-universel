import React from "react";

import { YoungDto } from "snu-lib/src/dto";

import YoungListHeaderConsent from "../consent/YoungListHeaderConsent";
import YoungListHeaderValidation from "../validation/YoungListHeaderValidation";
import YoungListHeaderImageRight from "../imageRight/YoungListHeaderImageRight";

interface Props {
  currentTab: "general" | "consent" | "validation" | "image";
  selectAll: boolean;
  onSelectAllChange: React.Dispatch<React.SetStateAction<boolean>>;
  selectedYoungs: YoungDto[];
  onSelectedYoungsChange: React.Dispatch<React.SetStateAction<YoungDto[]>>;
  youngList: YoungDto[];
}

export default function YoungListHeader({ currentTab, selectAll, onSelectAllChange, selectedYoungs, onSelectedYoungsChange, youngList }: Props) {
  switch (currentTab) {
    case "general":
      return (
        <tr className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 bg-gray-50">
          <th className="w-[30%]">Élèves</th>
          <th className="w-[20%]">Cohortes</th>
          <th className="w-[20%]">Classes</th>
          <th className="w-[20%] flex justify-center">Statuts</th>
          <th className="w-[10%] flex justify-center">Actions</th>
        </tr>
      );
    case "consent":
      return (
        <YoungListHeaderConsent
          selectAll={selectAll}
          onSelectAllChange={onSelectAllChange}
          selectedYoungs={selectedYoungs}
          onSelectedYoungsChange={onSelectedYoungsChange}
          youngList={youngList}
        />
      );
    case "validation":
      return (
        <YoungListHeaderValidation
          selectAll={selectAll}
          onSelectAllChange={onSelectAllChange}
          selectedYoungs={selectedYoungs}
          onSelectedYoungsChange={onSelectedYoungsChange}
          youngList={youngList}
        />
      );
    case "image":
      return (
        <YoungListHeaderImageRight
          selectAll={selectAll}
          onSelectAllChange={onSelectAllChange}
          selectedYoungs={selectedYoungs}
          onSelectedYoungsChange={onSelectedYoungsChange}
          youngList={youngList}
        />
      );
    default:
      return null;
  }
}

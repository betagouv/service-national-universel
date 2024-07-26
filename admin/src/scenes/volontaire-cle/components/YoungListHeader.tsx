import React from "react";

import YoungListHeaderConsent from "../consent/YoungListHeaderConsent";
import YoungListHeaderValidation from "../validation/YoungListHeaderValidation";
import YoungListHeaderImageRight from "../imageRight/YoungListHeaderImageRight";

export default function YoungListHeader({ currentTab, selectAll, setSelectAll, selectedYoungs, setSelectedYoungs, youngList }) {
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
        <YoungListHeaderConsent selectAll={selectAll} setSelectAll={setSelectAll} selectedYoungs={selectedYoungs} setSelectedYoungs={setSelectedYoungs} youngList={youngList} />
      );
    case "validation":
      return (
        <YoungListHeaderValidation selectAll={selectAll} setSelectAll={setSelectAll} selectedYoungs={selectedYoungs} setSelectedYoungs={setSelectedYoungs} youngList={youngList} />
      );
    case "image":
      return (
        <YoungListHeaderImageRight selectAll={selectAll} setSelectAll={setSelectAll} selectedYoungs={selectedYoungs} setSelectedYoungs={setSelectedYoungs} youngList={youngList} />
      );
    default:
      return null;
  }
}

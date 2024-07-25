import React from "react";

export default function YoungListHeaderConsent() {
  return (
    <tr className="flex items-center py-3 px-4 text-xs font-[500] leading-5 uppercase text-gray-500 bg-gray-50 cursor-default">
      <th className="w-[5%]">
        <input className="cursor-pointer w-5 h-5 ml-2" type="checkbox" />
      </th>
      <th className="w-[25%]">Élèves</th>
      <th className="w-[30%]">Classes</th>
      <th className="w-[30%]">Statuts</th>
      <th className="w-[10%]">Consentements</th>
    </tr>
  );
}

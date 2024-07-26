import React, { useEffect } from "react";
import { YoungDto } from "snu-lib/src/dto";

interface Props {
  selectAll: boolean;
  onSelectAllChange: React.Dispatch<React.SetStateAction<boolean>>;
  selectedYoungs: YoungDto[];
  onSelectedYoungsChange: React.Dispatch<React.SetStateAction<YoungDto[]>>;
  youngList: YoungDto[];
}

export default function YoungListHeaderConsent({ selectAll, onSelectAllChange, selectedYoungs, onSelectedYoungsChange, youngList }: Props) {
  const handleSelectAll = () => {
    if (selectAll) {
      onSelectedYoungsChange([]);
    } else {
      onSelectedYoungsChange(youngList);
    }
    onSelectAllChange(!selectAll);
  };

  useEffect(() => {
    onSelectAllChange(selectedYoungs.length === youngList.length && youngList.length > 0);
  }, [selectedYoungs, youngList.length]);
  return (
    <tr className="flex items-center py-3 px-4 text-xs font-[500] leading-5 uppercase text-gray-500 bg-gray-50 cursor-default">
      <th className="w-[5%]">
        <input className="cursor-pointer w-5 h-5 ml-2" type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      </th>
      <th className="w-[25%]">Élèves</th>
      <th className="w-[30%]">Classes</th>
      <th className="w-[30%]">Statuts</th>
      <th className="w-[10%]">Consentements</th>
    </tr>
  );
}

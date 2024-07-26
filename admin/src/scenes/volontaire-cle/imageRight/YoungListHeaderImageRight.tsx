import React, { useEffect } from "react";

export default function YoungListHeaderImageRight({ selectAll, setSelectAll, selectedYoungs, setSelectedYoungs, youngList }) {
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedYoungs([]);
    } else {
      setSelectedYoungs(youngList);
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    setSelectAll(selectedYoungs.length === youngList.length && youngList.length > 0);
  }, [selectedYoungs, youngList.length]);
  return (
    <tr className="flex items-center py-3 px-4 text-xs font-[500] leading-5 uppercase text-gray-500 bg-gray-50 cursor-default">
      <th className="w-[5%]">
        <input className="cursor-pointer w-5 h-5 ml-2" type="checkbox" checked={selectAll} onChange={() => handleSelectAll()} />
      </th>
      <th className="w-[40%]">Élèves</th>
      <th className="w-[45%]">Classes</th>
      <th className="w-[10%]">Droits à l'image</th>
    </tr>
  );
}

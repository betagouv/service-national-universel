import React from "react";
import { useHistory } from "react-router-dom";
import { regionList } from "snu-lib";
import Plus from "../../assets/icons/Plus";
import YearPicker from "../dashboard/components/YearPicker";

export default function tableDeRepartition() {
  const history = useHistory();
  const [cohort, setCohort] = React.useState("Février 2023 - C");

  return (
    <div className="flex flex-col w-full p-4 ">
      <div className="text-xl font-bold">Plan de répartition</div>
      <div className="flex mt-4">
        <YearPicker
          options={[
            { key: "Février 2023 - C", label: "Février 2023 - C" },
            { key: "Avril 2023 - A", label: "Avril 2023 - A" },
            { key: "Avril 2023 - B", label: "Avril 2023 - B" },
            { key: "Juin 2023", label: "Juin 2023" },
            { key: "Juillet 2023", label: "Juillet 2023" },
          ]}
          onChange={(c) => setCohort(c)}
          value={cohort}
        />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {regionList.map((region, index) => (
          <div
            key={index}
            className="flex items-cneter justify-between w-full p-4 bg-white rounded-xl cursor-pointer"
            onClick={() => history.push(`/table-de-repartition/${region}/${cohort}`)}>
            {region}
            <Plus className="text-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

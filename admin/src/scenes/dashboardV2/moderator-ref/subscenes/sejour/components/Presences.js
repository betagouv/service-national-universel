import React from "react";
import FullDoughnut from "../../../../components/graphs/FullDoughnut";
import OccupationBarVertical from "./OccupationBarVertical";

export default function Presences({ presence, JDM, depart, departTotal, departMotif }) {
  const departPercentage = departTotal ? depart?.true / departTotal : 0;
  return (
    <div className="flex flex-col gap-10 bg-white rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] px-8 pt-8 pb-16">
      <p className="text-base leading-5 font-bold text-gray-900">La présence en chiffres</p>
      <div className="flex justify-evenly">
        <FullDoughnut
          title="Présence à l'arrivée"
          legendSide="bottom"
          labels={["Oui", "Non", "Non renseigné"]}
          values={[presence?.true || 0, presence?.false || 0, presence?.NR || 0]}
          maxLegends={3}
        />
        <div className="flex justify-center items-center">
          <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300"></div>
        </div>
        <FullDoughnut
          title="Présence à la JDM"
          legendSide="bottom"
          labels={["Oui", "Non", "Non renseigné"]}
          values={[JDM?.true || 0, JDM?.false || 0, JDM?.NR || 0]}
          maxLegends={3}
        />
        <div className="flex justify-center items-center">
          <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300"></div>
        </div>
        <OccupationBarVertical percentage={departPercentage} nbDepart={depart?.true} departMotif={departMotif} />
      </div>
    </div>
  );
}

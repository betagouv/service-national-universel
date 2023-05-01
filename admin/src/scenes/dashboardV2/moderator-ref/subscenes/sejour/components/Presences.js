import React from "react";
import FullDoughnut from "../../../../components/graphs/FullDoughnut";
import OccupationBarVertical from "./OccupationBarVertical";
import { getLink as getOldLink } from "../../../../../../utils";

export default function Presences({ presence, JDM, depart, departTotal, departMotif, filter }) {
  const departPercentage = departTotal ? depart?.true / departTotal : 0;
  return (
    <div className="flex flex-col gap-10 rounded-lg bg-white px-6 pt-8 pb-16 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
      <p className="text-base font-bold leading-5 text-gray-900">La présence en chiffres</p>
      <div className="flex justify-evenly">
        <FullDoughnut
          title="Présence à l'arrivée"
          legendSide="bottom"
          labels={["Oui", "Non", "Non renseigné"]}
          values={[presence?.true || 0, presence?.false || 0, presence?.NR || 0]}
          maxLegends={3}
          tooltipsPercent={true}
          legendUrls={[
            getOldLink({ base: "/volontaire", filter: { ...filter }, filtersUrl: ['COHESION_PRESENCE=%5B"true"%5D'] }),
            getOldLink({ base: "/volontaire", filter: { ...filter }, filtersUrl: ['COHESION_PRESENCE=%5B"false"%5D'] }),
            getOldLink({ base: "/volontaire", filter: { ...filter }, filtersUrl: ['COHESION_PRESENCE=%5B"Non+renseigné"%5D'] }),
          ]}
        />
        <div className="flex items-center justify-center">
          <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
        </div>
        <FullDoughnut
          title="Présence à la JDM"
          legendSide="bottom"
          labels={["Oui", "Non", "Non renseigné"]}
          values={[JDM?.true || 0, JDM?.false || 0, JDM?.NR || 0]}
          maxLegends={3}
          tooltipsPercent={true}
          legendUrls={[
            getOldLink({ base: "/volontaire", filter: { ...filter }, filtersUrl: ['COHESION_JDM=%5B"true"%5D'] }),
            getOldLink({ base: "/volontaire", filter: { ...filter }, filtersUrl: ['COHESION_JDM=%5B"false"%5D'] }),
            getOldLink({ base: "/volontaire", filter: { ...filter }, filtersUrl: ['COHESION_JDM=%5B"Non+renseigné"%5D'] }),
          ]}
        />
        <div className="flex items-center justify-center">
          <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
        </div>
        <OccupationBarVertical percentage={departPercentage} nbDepart={depart?.true} departMotif={departMotif} filter={filter} />
      </div>
    </div>
  );
}

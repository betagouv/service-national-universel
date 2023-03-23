import React from "react";
import FullDoughnut from "../../../../components/graphs/FullDoughnut";

export default function MoreInfo() {
  return (
    <div className="flex flex-col gap-10 bg-white rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] px-8 pt-8 pb-16 w-[40%] ">
      <p className="text-base text-left leading-5 font-bold text-gray-900">Plus d’infos...</p>
      <div className="flex flex-col gap-10 items-center">
        <FullDoughnut
          title="Typologie"
          legendSide="right"
          labels={["Centre public État", "Centre public Collectivité", "Centre privé (asso, fondation)", "Centre privé (autre)"]}
          values={[45, 23, 38, 12]}
          maxLegends={4}
        />
        <FullDoughnut
          title="Domaine"
          legendSide="left"
          labels={["Établissement d’enseignement", "Centres de formation", "Centre de vacances", "Autre"]}
          values={[45, 23, 38, 12]}
          maxLegends={4}
        />
      </div>
    </div>
  );
}

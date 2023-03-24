import React from "react";
import FullDoughnut from "../../../../components/graphs/FullDoughnut";

export default function MoreInfo({ typology, domains }) {
  return (
    <div className="flex flex-col gap-10 bg-white rounded-lg shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] px-6 pt-8 pb-16 w-[40%] ">
      <p className="text-base text-left leading-5 font-bold text-gray-900">Plus d’infos...</p>
      <div className="flex flex-col gap-10 items-center">
        <FullDoughnut
          title="Typologie"
          legendSide="right"
          labels={["Centre public État", "Centre public Collectivité", "Centre privé (asso, fondation)", "Centre privé (autre)"]}
          values={[typology?.PUBLIC_ETAT || 0, typology?.PUBLIC_COLLECTIVITE || 0, typology?.PRIVE_ASSOCIATION || 0, typology?.PRIVE_AUTRE || 0]}
          maxLegends={4}
        />
        <FullDoughnut
          title="Domaine"
          legendSide="left"
          labels={["Établissement d’enseignement", "Centres de formation", "Centre de vacances", "Autre"]}
          values={[domains?.ETABLISSEMENT || 0, domains?.FORMATION || 0, domains?.VACANCES || 0, domains?.AUTRE || 0]}
          maxLegends={4}
        />
      </div>
    </div>
  );
}

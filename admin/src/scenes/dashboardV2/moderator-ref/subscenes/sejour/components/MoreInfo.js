import React from "react";
import FullDoughnut from "../../../../components/graphs/FullDoughnut";
import { getNewLink } from "../../../../../../utils";

export default function MoreInfo({ typology, domains, filter }) {
  return (
    <div className="flex w-[40%] flex-col gap-10 rounded-lg bg-white px-6 pt-8 pb-16 shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)] ">
      <p className="font-bNew text-left text-base leading-5 text-gray-900">Plus d’infos...</p>
      <div className="flex flex-col items-center gap-10">
        <FullDoughnut
          title="Typologie"
          legendSide="right"
          labels={["Centre public État", "Centre public Collectivité", "Centre privé (asso, fondation)", "Centre privé (autre)"]}
          values={[typology?.PUBLIC_ETAT || 0, typology?.PUBLIC_COLLECTIVITE || 0, typology?.PRIVE_ASSOCIATION || 0, typology?.PRIVE_AUTRE || 0]}
          maxLegends={4}
          tooltipsPercent={true}
          legendUrls={[
            getNewLink({ base: "/centre/liste/liste-centre", filter: filter, filtersUrl: ["typology=PUBLIC_ETAT"] }, "center"),
            getNewLink({ base: "/centre/liste/liste-centre", filter: filter, filtersUrl: ["typology=PUBLIC_COLLECTIVITE"] }, "center"),
            getNewLink({ base: "/centre/liste/liste-centre", filter: filter, filtersUrl: ["typology=PRIVE_ASSOCIATION"] }, "center"),
            getNewLink({ base: "/centre/liste/liste-centre", filter: filter, filtersUrl: ["typology=PRIVE_AUTRE"] }, "center"),
          ]}
        />
        <FullDoughnut
          title="Domaine"
          legendSide="left"
          labels={["Établissement d’enseignement", "Centres de formation", "Centre de vacances", "Autre"]}
          values={[domains?.ETABLISSEMENT || 0, domains?.FORMATION || 0, domains?.VACANCES || 0, domains?.AUTRE || 0]}
          maxLegends={4}
          tooltipsPercent={true}
          legendUrls={[
            getNewLink({ base: "/centre/liste/liste-centre", filter: filter, filtersUrl: ["domain=ETABLISSEMENT"] }, "center"),
            getNewLink({ base: "/centre/liste/liste-centre", filter: filter, filtersUrl: ["domain=FORMATION"] }, "center"),
            getNewLink({ base: "/centre/liste/liste-centre", filter: filter, filtersUrl: ["domain=VACANCES"] }, "center"),
            getNewLink({ base: "/centre/liste/liste-centre", filter: filter, filtersUrl: ["domain=AUTRE"] }, "center"),
          ]}
        />
      </div>
    </div>
  );
}

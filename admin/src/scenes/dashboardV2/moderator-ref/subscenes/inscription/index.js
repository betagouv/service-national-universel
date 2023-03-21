import React from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import HorizontalBar from "../../../components/graphs/HorizontalBar";

import { FilterDashBoard } from "../../../components/FilterDashBoard";
export default function Index() {
  const filterArray = [
    {
      name: "Région",
      datafield: "region.keyword",
      fullValue: "Toutes",
      options: [
        { key: "Ile de france", label: "Ile de france" },
        { key: "Bretagne", label: "Bretagne" },
        { key: "oui", label: "oui" },
        { key: "oui oui", label: "oui oui" },
      ],
    },
    {
      name: "Département",
      datafield: "departement.keyword",
      fullValue: "Tous",
      options: [
        { key: "Ile de france", label: "Ile de france" },
        { key: "Bretagne", label: "Bretagne" },
      ],
    },
    {
      name: "Date de début",
      customComponent: (setFilter, filter) => <div>Custom component</div>,
    },
  ];

  const [selectedFilters, setSelectedFilters] = React.useState({});
  return (
    <DashboardContainer
      active="inscription"
      availableTab={["general", "engagement", "sejour", "inscription"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
          <ButtonPrimary className="text-sm">
            Exporter les statistiques <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
        </div>
      }>
      <div>Inscription</div>
      <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
      <div className="bg-white my-4 p-8 rounded-lg">
        <HorizontalBar
          title="Objectif des inscriptions"
          labels={["Sur la liste principale", "Sue liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
          values={[31527, 450, 901, 901, 3359]}
          goal={45039}
        />
      </div>
    </DashboardContainer>
  );
}

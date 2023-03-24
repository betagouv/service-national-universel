import React from "react";

import DashboardContainer from "../../../components/DashboardContainer";
import FullDoughnut from "../../../components/graphs/FullDoughnut";
import DemiDoughnut from "../../../components/graphs/DemiDoughnut";
import { Legends } from "../../../components/graphs/graph-commons";
import BarChart from "../../../components/graphs/BarChart";
import RoundRatio from "../../../components/graphs/RoundRatio";
import HorizontalBar from "../../../components/graphs/HorizontalBar";

export default function Index() {
  return (
    <DashboardContainer active="general" availableTab={["general", "engagement", "sejour", "inscription"]}>
      <h4>Full Doughnut</h4>
      <div className="bg-white m-8 p-8 grid grid-cols-2 gap-2">
        <FullDoughnut title="Left" legendSide="left" labels={["Oui", "Non", "Non renseigné"]} values={[45, 23, 38]} />
        <FullDoughnut title="Right" legendSide="right" labels={["Oui", "Non", "Non renseigné"]} values={[45, 23, 38]} />
        <FullDoughnut title="Left max 2" legendSide="left" labels={["Oui", "Non", "Non renseigné", "Autre"]} values={[45, 23, 38, 42]} maxLegends={2} />
        <FullDoughnut title="Right max 2" legendSide="right" labels={["Oui", "Non", "Non renseigné", "Autre"]} values={[45, 23, 38, 10]} maxLegends={2} />

        <FullDoughnut title="Top" legendSide="top" labels={["Oui", "Non", "Non renseigné"]} values={[45, 23, 38]} />
        <FullDoughnut title="Top max 2" legendSide="top" labels={["Oui", "Non", "Non renseigné"]} values={[45, 23, 38]} maxLegends={2} />
        <FullDoughnut title="Bottom" legendSide="bottom" labels={["Oui", "Non", "Non renseigné", "Autre"]} values={[45, 23, 38, 42]} />
        <FullDoughnut title="Bottom max 2" legendSide="bottom" labels={["Oui", "Non", "Non renseigné", "Autre"]} values={[45, 23, 38, 10]} maxLegends={2} />
      </div>

      <h4>Demi Doughnut</h4>
      <div className="bg-white m-8 px-8 pt-8">
        <DemiDoughnut title="Places proposées" labels={["Occupées", "Disponibles"]} values={[40, 12]} />
      </div>

      <h4>Legends</h4>
      <div className="bg-white m-8 p-8">
        <Legends labels={["Première", "Seconde", "Troisième"]} values={[40, 12, 34]} className="mb-8" />
        <Legends labels={["Première", "Seconde", "Troisième", "Sans valeur"]} />
      </div>

      <h4>Bar Chart</h4>
      <div className="bg-white m-8 p-8 flex justify-between items-end">
        <BarChart title="1. Solidarité" values={[16, 9]} unit="%" className="h-[100px]" />
        <BarChart title="2. Test more" values={[16, 9, 25, 3]} unit="%" className="h-[200px] mt-8" />
        <BarChart values={[16, 9, 25, 3]} noValue className="h-[200px] mt-8" />
      </div>

      <h4>Round Ratio</h4>
      <div className="bg-white m-8 p-8 flex justify-around items-center">
        <RoundRatio value={0.09} className="w-[64px] h-[64px]" />
        <RoundRatio value={1} className="w-[128px] h-[128px]" />
        <RoundRatio value={0.96} className="w-[128px] h-[128px]" />
        <RoundRatio value={0.83} className="w-[64px] h-[64px]" />
        <RoundRatio value={0.017} className="w-[64px] h-[64px]" />
      </div>

      <h4>Horizontal Bar</h4>
      <div className="bg-white m-8 p-8">
        <HorizontalBar
          title="Objectif des inscriptions"
          labels={["Sur la liste principale", "Sue liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
          values={[31527, 450, 901, 901, 3359]}
          goal={45039}
        />
        <HorizontalBar
          className="mt-8"
          title="Objectif des inscriptions"
          labels={["Sur la liste principale", "Sue liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
          values={[31527, 450, 901, 4901, 10359]}
          goal={45039}
        />
      </div>
    </DashboardContainer>
  );
}

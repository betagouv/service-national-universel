import React, { useState } from "react";
import { academyList, COHORTS, departmentList, regionList, translateInscriptionStatus, translatePhase1, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import { FilterDashBoard } from "../../../components/FilterDashBoard";
import BoxWithPercentage from "./components/BoxWithPercentage";
import CardCenterCapacity from "./components/CardCenterCapacity";
import Cardsession from "./components/Cardsession";
import MoreInfo from "./components/MoreInfo";
import OccupationCardHorizontal from "./components/OccupationCardHorizontal";
import Presences from "./components/Presences";
import StatusPhase1 from "./components/StatusPhase1";
import TabSession from "./components/TabSession";

const filterArray = [
  {
    id: "status",
    name: "Statut d’inscription",
    fullValue: "Tous",
    options: Object.keys(YOUNG_STATUS).map((status) => ({ key: status, label: translateInscriptionStatus(status) })),
  },
  {
    id: "statusPhase1",
    name: "Statut de phase 1",
    fullValue: "Tous",
    options: Object.keys(YOUNG_STATUS_PHASE1).map((status) => ({ key: status, label: translatePhase1(status) })),
  },
  {
    id: "region",
    name: "Région",
    fullValue: "Toutes",
    options: regionList.map((region) => ({ key: region, label: region })),
  },
  {
    id: "academy",
    name: "Académie",
    fullValue: "Toutes",
    options: academyList.map((academy) => ({ key: academy, label: academy })),
  },
  {
    id: "department",
    name: "Département",
    fullValue: "Tous",
    options: departmentList.map((department) => ({ key: department, label: department })),
  },
  {
    id: "cohort",
    name: "Cohorte",
    fullValue: "Toutes",
    options: COHORTS.map((cohort) => ({ key: cohort, label: cohort })),
  },
];

export default function Index() {
  const [selectedFilters, setSelectedFilters] = useState({
    status: [YOUNG_STATUS.VALIDATED],
    statusPhase1: [YOUNG_STATUS_PHASE1.AFFECTED],
    cohort: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023"],
  });

  return (
    <DashboardContainer
      active="sejour"
      availableTab={["general", "engagement", "sejour", "inscription"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Séjour”</span>
          </ButtonPrimary>
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Séjour”</span>
          </ButtonPrimary>
        </div>
      }>
      <div className="flex flex-col gap-8">
        <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
        <h1 className="text-[28px] leading-8 font-bold text-gray-900">Volontaires</h1>
        <div className="flex items-stretch gap-4 ">
          <div className="flex flex-col gap-4 w-[30%]">
            <BoxWithPercentage percentage={0.9} number={48} title="Point de rassemblement" subLabel="restants à confirmer" />
            <BoxWithPercentage percentage={0.84} number={8} title="Participation" subLabel="restants à confirmer" />
          </div>
          <StatusPhase1 />
        </div>
        <Presences />
        <h1 className="text-[28px] leading-8 font-bold text-gray-900">Centres</h1>
        <div className="grid grid-cols-3 gap-4">
          <CardCenterCapacity nbCenter={7} capacity={231} />
          <Cardsession nbValidated={1} nbPending={3} />
          <OccupationCardHorizontal total={198} taken={184} />
          <BoxWithPercentage percentage={0.61} number={12} title="Emplois du temps" subLabel="restants à renseigner" />
        </div>
        <div className="flex items-stretch gap-4 ">
          <MoreInfo />
          <TabSession />
        </div>
      </div>
    </DashboardContainer>
  );
}

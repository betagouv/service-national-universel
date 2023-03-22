import React from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import BoxWithPercentage from "./components/BoxWithPercentage";
import CardCenterCapacity from "./components/CardCenterCapacity";
import Cardsession from "./components/Cardsession";
import MoreInfo from "./components/MoreInfo";
import OccupationCardHorizontal from "./components/OccupationCardHorizontal";
import Presences from "./components/Presences";
import StatusPhase1 from "./components/StatusPhase1";
import TabSession from "./components/TabSession";

export default function Index() {
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
          <CardCenterCapacity />
          <Cardsession />
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

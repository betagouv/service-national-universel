import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { HiOutlineSearch, HiOutlineAdjustments } from "react-icons/hi";

import { canCreateApplications, YOUNG_STATUS_PHASE2, YoungDto } from "snu-lib";
import { Button } from "@snu/ds/admin";

import { knowledgebaseURL } from "@/config";
import Hammer from "@/assets/icons/Hammer";
import Screwdriver from "@/assets/icons/Screwdriver";
import AdjustableWrench from "@/assets/icons/AdjustableWrench";
import { CohortState } from "@/redux/cohorts/reducer";

interface ToolboxProps {
  young: YoungDto;
}

export default function Toolbox({ young }: ToolboxProps): JSX.Element {
  const cohortList = useSelector((state: CohortState) => state.Cohorts);
  const history = useHistory();

  const cohort = cohortList.find((c) => c.name === young.cohort);
  const canYoungApplyToPhase2 = canCreateApplications(young, cohort);

  let applyToPhase2Tooltip = "";
  if (!canYoungApplyToPhase2) {
    applyToPhase2Tooltip =
      young.statusPhase2 === YOUNG_STATUS_PHASE2.DESENGAGED
        ? "Il n'est pas possible de proposer de mission à un jeune dont le statut phase 2 est désengagé"
        : "Le jeune est désengagé de la phase 2";
  }

  return (
    <div className="flex flex-col">
      <div className="text-2xl font-bold leading-8">Mes outils pour aider mon volontaire</div>
      <div className="my-4 flex items-stretch gap-3">
        <div className="flex basis-1/3 flex-col rounded-xl bg-white p-4 shadow-block">
          <div className="mb-4 flex flex-1 items-center gap-6">
            <Hammer />
            <div className="flex flex-1 flex-col gap-2">
              <div className="text-lg font-bold">Proposer une mission existante</div>
              <div className="text-gray-600">Trouvez une mission existante et proposez-là au volontaire.</div>
              <a
                className="cursor-pointer text-gray-500 underline"
                href={`${knowledgebaseURL}/base-de-connaissance/je-propose-une-mission-a-un-volontaire`}
                target="_blank"
                rel="noopener noreferrer">
                En savoir plus.
              </a>
            </div>
          </div>
          <Button
            title="Trouver une mission"
            leftIcon={<HiOutlineSearch className="h-5 w-5 text-blue-300" />}
            tooltip={applyToPhase2Tooltip}
            disabled={!canYoungApplyToPhase2}
            className="w-full"
            onClick={() => canYoungApplyToPhase2 && history.push(`/volontaire/${young._id}/phase2/propose-mission`)}
          />
        </div>
        <div className="flex basis-1/3 flex-col rounded-xl bg-white p-4 shadow-block">
          <div className="mb-4 flex flex-1 items-center gap-6">
            <Screwdriver />
            <div className="flex flex-1 flex-col gap-2">
              <div className="text-lg font-bold">Déclarer une équivalence MIG</div>
              <div className="text-gray-600">Reconnaissez l'engagement externe du volontaire comme équivalence MIG.</div>
              <a
                className="cursor-pointer text-gray-500 underline"
                href={`${knowledgebaseURL}/base-de-connaissance/valider-ou-declarer-une-equivalence-mig`}
                target="_blank"
                rel="noopener noreferrer">
                En savoir plus.
              </a>
            </div>
          </div>
          <Button
            title="Déclarer une équivalence MIG"
            tooltip={applyToPhase2Tooltip}
            className="w-full"
            onClick={() => history.push(`/volontaire/${young._id}/phase2/equivalence`)}
          />
        </div>
        <div className="flex basis-1/3 flex-col rounded-xl bg-white p-4 shadow-block">
          <div className="mb-4 flex flex-1 items-center gap-6">
            <AdjustableWrench />
            <div className="flex flex-1 flex-col gap-2">
              <div className="text-lg font-bold">Créer une mission personnalisée</div>
              <div className="text-gray-600">Renseignez une mission non existante pour le volontaire.</div>
              <a
                className="cursor-pointer text-gray-500 underline"
                href={`${knowledgebaseURL}/base-de-connaissance/je-cree-une-mig-depuis-le-profil-dun-volontaire`}
                target="_blank"
                rel="noopener noreferrer">
                En savoir plus.
              </a>
            </div>
          </div>
          <Button
            title="Créer une mission personnalisée"
            leftIcon={<HiOutlineAdjustments className="h-5 w-5 text-blue-300" />}
            tooltip={applyToPhase2Tooltip}
            disabled={!canYoungApplyToPhase2}
            className="w-full"
            onClick={() => canYoungApplyToPhase2 && history.push(`/volontaire/${young._id}/phase2/mission-personnalisé`)}
          />
        </div>
      </div>
    </div>
  );
}

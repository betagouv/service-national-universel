import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { HiOutlineSearch, HiOutlineAdjustments } from "react-icons/hi";
import { canCreateApplications } from "snu-lib";
import Hammer from "../../../assets/icons/Hammer";
import Screwdriver from "../../../assets/icons/Screwdriver";
import AdjustableWrench from "../../../assets/icons/AdjustableWrench";
import { knowledgebaseURL } from "../../../config";

export default function Toolbox({ young }) {
  const cohortList = useSelector((state) => state.Cohorts);
  const history = useHistory();

  const cohort = cohortList.find((c) => c.name === young.cohort);
  const canYoungApplyToPhase2 = canCreateApplications(young, cohort);

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
          <button
            data-tip=""
            data-for="tooltip-custom"
            className={`group flex items-center justify-center gap-1 rounded-[10px] border-[1px] border-blue-600 bg-blue-600  py-2 ${
              canYoungApplyToPhase2 ? "hover:border-[#4881FF] hover:bg-[#4881FF] " : "!cursor-not-allowed"
            }`}
            onClick={() => canYoungApplyToPhase2 && history.push(`/volontaire/${young._id}/phase2/propose-mission`)}>
            <HiOutlineSearch className="h-5 w-5 text-blue-300" />
            <div className={`text-sm text-blue-100 ${canYoungApplyToPhase2 && "group-hover:text-white"}`}>Trouver une mission</div>
          </button>
          {!canYoungApplyToPhase2 ? (
            <ReactTooltip id="tooltip-custom" className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
              <div className="text-[black]">Le jeune n&apos;est pas éligible à la phase 2</div>
            </ReactTooltip>
          ) : null}
        </div>
        <div className="flex basis-1/3 flex-col rounded-xl bg-white p-4 shadow-block">
          <div className="mb-4 flex flex-1 items-center gap-6">
            <Screwdriver />
            <div className="flex flex-1 flex-col gap-2">
              <div className="text-lg font-bold">Déclarer une équivalence MIG</div>
              <div className="text-gray-600">Reconnaissez l’engagement externe du volontaire comme équivalence MIG.</div>
              <a
                className="cursor-pointer text-gray-500 underline"
                href={`${knowledgebaseURL}/base-de-connaissance/valider-ou-declarer-une-equivalence-mig`}
                target="_blank"
                rel="noopener noreferrer">
                En savoir plus.
              </a>
            </div>
          </div>
          <button
            className="group flex items-center justify-center gap-1 rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2 hover:border-[#4881FF] hover:bg-[#4881FF]"
            onClick={() => history.push(`/volontaire/${young._id}/phase2/equivalence`)}>
            <div className="text-sm text-blue-100 group-hover:text-white ">Déclarer une équivalence MIG</div>
          </button>
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
          <button
            data-tip=""
            data-for="tooltip-custom"
            className={`group flex items-center justify-center gap-1 rounded-[10px] border-[1px] border-blue-600 bg-blue-600  py-2 ${
              canYoungApplyToPhase2 ? "hover:border-[#4881FF] hover:bg-[#4881FF] " : "!cursor-not-allowed"
            }`}
            onClick={() => canYoungApplyToPhase2 && history.push(`/volontaire/${young._id}/phase2/mission-personnalisé`)}>
            <HiOutlineAdjustments className="h-5 w-5 text-blue-300" />
            <div className={`text-sm text-blue-100 ${canYoungApplyToPhase2 && "group-hover:text-white"}`}>Créer une mission personnalisée</div>
          </button>
          {!canYoungApplyToPhase2 ? (
            <ReactTooltip id="tooltip-custom" className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
              <div className="text-[black]">Le jeune n&apos;est pas éligible à la phase 2</div>
            </ReactTooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
}

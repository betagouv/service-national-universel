import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { HiOutlineSearch, HiOutlineAdjustments } from "react-icons/hi";
import { canUserCreateApplication, canUserCreateEquivalence, ROLES, isCohortFullyArchived } from "snu-lib";
import Hammer from "../../../assets/icons/Hammer";
import Screwdriver from "../../../assets/icons/Screwdriver";
import AdjustableWrench from "../../../assets/icons/AdjustableWrench";
import { knowledgebaseURL } from "../../../config";

export default function Toolbox({ young, applications = [] }) {
  const cohortList = useSelector((state) => state.Cohorts);
  const { user } = useSelector((state) => state.Auth);
  const history = useHistory();

  const cohort = cohortList.find((c) => c.name === young.cohort);
  const isRegionalOrDepartmental = [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role);
  const isCohortFullyArchivedForReferent = isRegionalOrDepartmental && isCohortFullyArchived(cohort);
  
  const canCreateCustomMission = canUserCreateApplication(young, cohort, user.role, applications);
  const canProposeExistingMission = canUserCreateApplication(young, cohort, user.role, applications);
  const canCreateEquivalence = canUserCreateEquivalence(young, cohort, user.role);

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
            disabled={!canProposeExistingMission}
            data-tip=""
            data-for="tooltip-custom"
            className={`group flex items-center justify-center gap-1 rounded-[10px] border-[1px] py-2 ${
              canProposeExistingMission
                ? "border-blue-600 bg-blue-600 hover:border-[#4881FF] hover:bg-[#4881FF]"
                : "border-gray-400 bg-gray-400 !cursor-not-allowed opacity-50"
            }`}
            onClick={() => canProposeExistingMission && history.push(`/volontaire/${young._id}/phase2/propose-mission`)}>
            <HiOutlineSearch className={`h-5 w-5 ${canProposeExistingMission ? "text-blue-300" : "text-gray-200"}`} />
            <div className={`text-sm ${canProposeExistingMission ? "text-blue-100 group-hover:text-white" : "text-gray-200"}`}>Trouver une mission</div>
          </button>
          {!canProposeExistingMission ? (
            <ReactTooltip id="tooltip-custom" className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
              <div className="text-[black]">
                {isCohortFullyArchivedForReferent
                  ? "Vous ne pouvez plus effectuer cette action. La cohorte du jeune est archivée."
                  : user.role === ROLES.ADMIN
                    ? "Le jeune doit avoir validé ou être dispensé de sa phase 1, et sa phase 2 ne doit pas être validée."
                    : isRegionalOrDepartmental
                      ? "Le jeune doit avoir validé ou être dispensé de sa phase 1, sa phase 2 ne doit pas être validée, et avoir au moins une mission effectuée."
                      : "Le jeune n'est pas éligible à la phase 2"}
              </div>
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
            disabled={!canCreateEquivalence}
            data-tip=""
            data-for="tooltip-equivalence"
            className={`group flex items-center justify-center gap-1 rounded-[10px] border-[1px] py-2 ${
              canCreateEquivalence
                ? "border-blue-600 bg-blue-600 hover:border-[#4881FF] hover:bg-[#4881FF]"
                : "border-gray-400 bg-gray-400 !cursor-not-allowed opacity-50"
            }`}
            onClick={() => canCreateEquivalence && history.push(`/volontaire/${young._id}/phase2/equivalence`)}>
            <div className={`text-sm ${canCreateEquivalence ? "text-blue-100 group-hover:text-white" : "text-gray-200"}`}>Déclarer une équivalence MIG</div>
          </button>
          {!canCreateEquivalence ? (
            <ReactTooltip id="tooltip-equivalence" className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
              <div className="text-[black]">
                {isCohortFullyArchivedForReferent
                  ? "Vous ne pouvez plus effectuer cette action. La cohorte du jeune est archivée."
                  : "Pour déclarer une équivalence de MIG, la cohorte du jeune ne doit pas être archivée."}
              </div>
            </ReactTooltip>
          ) : null}
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
            disabled={!canCreateCustomMission}
            data-tip=""
            data-for="tooltip-custom-mission"
            className={`group flex items-center justify-center gap-1 rounded-[10px] border-[1px] py-2 ${
              canCreateCustomMission
                ? "border-blue-600 bg-blue-600 hover:border-[#4881FF] hover:bg-[#4881FF]"
                : "border-gray-400 bg-gray-400 !cursor-not-allowed opacity-50"
            }`}
            onClick={() => canCreateCustomMission && history.push(`/volontaire/${young._id}/phase2/mission-personnalisé`)}>
            <HiOutlineAdjustments className={`h-5 w-5 ${canCreateCustomMission ? "text-blue-300" : "text-gray-200"}`} />
            <div className={`text-sm ${canCreateCustomMission ? "text-blue-100 group-hover:text-white" : "text-gray-200"}`}>Créer une mission personnalisée</div>
          </button>
          {!canCreateCustomMission ? (
            <ReactTooltip id="tooltip-custom-mission" className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
              <div className="text-[black]">
                {isCohortFullyArchivedForReferent
                  ? "Vous ne pouvez plus effectuer cette action. La cohorte du jeune est archivée."
                  : user.role === ROLES.ADMIN
                    ? "Le jeune doit avoir validé ou être dispensé de sa phase 1, et sa phase 2 ne doit pas être validée."
                    : isRegionalOrDepartmental
                      ? "Le jeune doit avoir validé ou être dispensé de sa phase 1, sa phase 2 ne doit pas être validée, et avoir au moins une mission effectuée."
                      : "Le jeune n'est pas éligible à la phase 2"}
              </div>
            </ReactTooltip>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import { supportURL } from "@/config";
import { PHASE2_TOTAL_HOURS, APPLICATION_STATUS, EQUIVALENCE_STATUS } from "snu-lib";
import { useQuery } from "@tanstack/react-query";
import useAuth from "@/services/useAuth";
import { HiPlus, HiSearch } from "react-icons/hi";
import { RiMedal2Line } from "react-icons/ri";
import InfobulleIcon from "../../../assets/infobulleIcon.svg";
import SemiCircleProgress from "../components/SemiCircleProgress";
import EquivalenceCard from "../components/EquivalenceCard";
import ApplicationCard from "../components/ApplicationCard";
import { fetchApplications, fetchEquivalences } from "../engagement.repository";
import { statusColors } from "../engagement.utils";
import { translateStatusMilitaryPreparationFiles } from "../../../utils";
import Loader from "@/components/Loader";

const Tooltip = ({ className }) => (
  <span className={className}>
    <img src={InfobulleIcon} data-tip data-for="info" />
    <ReactTooltip
      clickable
      type="light"
      effect="solid"
      delayHide={1000}
      id="info"
      className="w-[527px] bg-white custom-tooltip-radius !opacity-100 !shadow-md"
      tooltipRadius="6"
      arrowColor="white">
      <div className="list-outside bg-white text-left text-[15px] text-[#414458]">
        Vous disposez d’un an pour débuter votre phase d’engagement et de deux ans pour la terminer.{" "}
        <a className="!text-blue-600" href={`${supportURL}/base-de-connaissance/de-combien-de-temps-je-dispose-pour-realiser-ma-mig`} target="_blank" rel="noreferrer">
          En savoir plus.
        </a>
      </div>
    </ReactTooltip>
  </span>
);

const MilitaryStatusBadge = ({ young, className }) => (
  <div className={`${className} md:ml-auto text-xs font-normal  ${statusColors[young.statusMilitaryPreparationFiles]} rounded-sm px-2 py-[2px] `}>
    {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
  </div>
);

export default function View() {
  const { young } = useAuth();
  const phase2NumberHoursDone = young.phase2NumberHoursDone || 0;
  const applications = useQuery({ queryKey: ["application"], queryFn: () => fetchApplications(young._id) });
  const equivalences = useQuery({ queryKey: ["equivalence"], queryFn: () => fetchEquivalences(young._id) });

  if (equivalences.isPending || applications.isPending) {
    return <Loader />;
  }

  const missionDoneCards = [...applications.data.filter(({ status }) => [APPLICATION_STATUS.DONE, APPLICATION_STATUS.IN_PROGRESS].includes(status)), ...equivalences.data].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const missionCandidateCards = applications.data
    .filter(({ status }) =>
      [
        APPLICATION_STATUS.WAITING_ACCEPTATION,
        APPLICATION_STATUS.WAITING_VALIDATION,
        APPLICATION_STATUS.WAITING_VERIFICATION,
        APPLICATION_STATUS.VALIDATED,
        APPLICATION_STATUS.REFUSED,
        APPLICATION_STATUS.ABANDON,
        APPLICATION_STATUS.CANCEL,
      ].includes(status),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="mt-[3rem]">
      <div className="grid grid-cols-2 border shadow-sm rounded-2xl border-gray-200 justify-center items-center">
        <span className="w-full relative">
          <SemiCircleProgress current={phase2NumberHoursDone} total={PHASE2_TOTAL_HOURS}></SemiCircleProgress>
          <Tooltip className="absolute top-4 right-4" />
        </span>
        {!missionDoneCards.length ? (
          <span className="p-4 md:p-8 md:basis-6/12 flex flex-col sm:border-t-2 md:border-t-0 md:border-l-2 text-center">
            <span className="font-bold">C'est parti !</span>
            <span className="text-gray-400 text-sm">Engagez vous au service de la nation.</span>
            <div className="flex flex-col justify-center gap-4 my-6">
              <Link to="/mission" className="text-sm bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md px-3 py-2.5 text-center mx-auto w-72">
                <HiSearch className="inline-block mr-2 text-xl align-text-bottom" />
                Trouver un engagement
              </Link>
              <Link
                to="/phase2/equivalence"
                className="text-sm border rounded-md px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors text-center mx-auto w-72">
                <HiPlus className="inline-block mr-2 text-xl align-text-bottom" />
                Ajouter un engagement réalisé
              </Link>
            </div>
          </span>
        ) : null}
      </div>

      {equivalences.isError ||
        (applications.isError && (
          <div className="mt-8 mb-4 max-w-6xl px-3 mx-auto">
            <div className="p-12 bg-white rounded-lg shadow-sm">
              <p className="text-center text-gray-500">Erreur lors du chargement des engagements&nbsp;🥲</p>
            </div>
          </div>
        ))}

      {missionDoneCards.length ? (
        <>
          <h2 className="font-bold text-2xl md:text-3xl mt-[1rem] md:mt-[3rem]">
            Engagements réalisés
            {phase2NumberHoursDone < PHASE2_TOTAL_HOURS && (
              <Link
                to="/phase2/equivalence"
                className="ml-4 text-sm font-normal bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-full md:rounded-md md:px-3 p-2.5 text-center">
                <HiPlus className="inline-block text-xl align-text-bottom" />
                <span className="hidden md:inline">Ajouter</span>
              </Link>
            )}
          </h2>
          <div className="flex flex-col md:flex-row gap-4 pb-3 flex-wrap pt-4">
            {missionDoneCards.map((data) =>
              data.engagementType === "mig" ? <ApplicationCard key={data._id} application={data} /> : <EquivalenceCard key={data._id} equivalence={data} />,
            )}
          </div>
        </>
      ) : null}

      {missionCandidateCards.length ? (
        <>
          <h2 className="mt-[1rem] md:mt-[3rem] font-bold text-2xl md:text-3xl">Candidatures</h2>
          <div className="flex flex-col md:flex-row gap-3 pb-3 flex-wrap pt-4">
            {missionCandidateCards.map((data) =>
              data.engagementType === "mig" ? <ApplicationCard key={data._id} application={data} /> : <EquivalenceCard key={data._id} equivalence={data} />,
            )}
          </div>
        </>
      ) : null}

      <h2 className="font-bold text-2xl md:text-3xl mt-[1rem] md:mt-3rem]">Préparations Militaires</h2>
      <div className="mt-4 flex justify-center md:justify-start flex-row p-4 bg-gray-50 border shadow-sm rounded-2xl border-gray-200 items-center">
        <RiMedal2Line className="text-5xl md:text-4xl p-1 md:p-2 bg-gray-200 rounded-full" />
        <span className="flex flex-col ml-4">
          <MilitaryStatusBadge className="md:hidden w-20" young={young}></MilitaryStatusBadge>
          <span>Mon dossier d'éligibilité</span>

          <Link className="text-blue-600" to="/ma-preparation-militaire">
            {young.statusMilitaryPreparationFiles ? "Consulter" : "Compléter"}
          </Link>
        </span>
        <MilitaryStatusBadge className="sm:hidden md:flex" young={young}></MilitaryStatusBadge>
      </div>
    </div>
  );
}

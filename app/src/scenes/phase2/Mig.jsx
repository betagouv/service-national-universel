import React from "react";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import MobileView from "./mobile";
import { supportURL } from "@/config";
import Loader from "@/components/Loader";
import Validated from "./Validated";
import { useQuery } from "@tanstack/react-query";
import InfobulleIcon from "../../assets/infobulleIcon.svg";
import SemiCircleProgress from "./components/SemiCircleProgress";
import EquivalenceCard from "./components/EquivalenceCard";
import ApplicationCard from "./components/ApplicationCard";
import { APPLICATION_STATUS, EQUIVALENCE_STATUS, YOUNG_STATUS_PHASE2 } from "snu-lib";
import useAuth from "@/services/useAuth";
import { HiPlus, HiSearch } from "react-icons/hi";
import { fetchApplications, fetchEquivalences } from "./repo";

const Tooltip = ({ className }) => (
  <span className={className}>
    <img src={InfobulleIcon} data-tip data-for="info" />
    <ReactTooltip clickable effect="solid" id="info" className="w-[527px] bg-white shadow-xl" arrowColor="white">
      <div className="bg-white mb-2 text-left text-[15px] text-[#414458]">
        Vous disposez d’un an pour débuter votre phase d’engagement et de deux ans pour la terminer.
        <a href={`${supportURL}/base-de-connaissance/de-combien-de-temps-je-dispose-pour-realiser-ma-mig`} target="_blank" rel="noreferrer" className="">
          En savoir plus.
        </a>
      </div>
    </ReactTooltip>
  </span>
);

export default function View() {
  const { young } = useAuth();
  const phase2NumberHoursDone = young.phase2NumberHoursDone || 0;
  // const phase2NumberHoursDone = 0;
  const applications = useQuery({ queryKey: ["application"], queryFn: () => fetchApplications(young._id) });
  const equivalences = useQuery({ queryKey: ["equivalence"], queryFn: () => fetchEquivalences(young._id) });

  const missionDoneCards =
    (applications.data || equivalences.data) &&
    [...applications.data, ...equivalences.data]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter(({ status }) =>
        [APPLICATION_STATUS.DONE, EQUIVALENCE_STATUS.VALIDATED, EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.WAITING_VERIFICATION].includes(status),
      );
  const missionCandidateCards =
    applications.data && applications.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).filter(({ status }) => status !== APPLICATION_STATUS.DONE);

  if (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) return <Validated></Validated>;

  return (
    <div className="p-8 flex flex-col">
      <h1 className="mt-6 mb-6 mx-auto text-center font-bold text-4xl md:text-5xl max-w-xl leading-tight md:leading-tight">Mes engagements</h1>
      <span className="p-8 flex justify-center ">
        <span className="pr-1 pl-1 text-blue-600  pb-2 border-b-2 border-blue-600 cursor-pointer">Tableau de bord</span>
        <Link to="/preferences" className="pr-1 pl-1 text-gray-400 ml-4 pb-2 cursor-pointer hover:text-blue-600 hover:border-b-2 border-blue-600">
          Mes préférences
        </Link>
      </span>
      <div className="flex flex-col md:flex-row border-2 rounded-2xl border-gray-200 justify-center items-center">
        <span className="relative">
          <SemiCircleProgress current={phase2NumberHoursDone} total={84}></SemiCircleProgress>
          <Tooltip className="absolute top-2 right-0" />
        </span>
        {phase2NumberHoursDone == 0 && (
          <span className="m-4 p-8 flex flex-col sm:border-t-2 md:border-t-0 md:border-l-2 text-center">
            <span className="font-bold">C'est parti !</span>
            <span className="text-gray-400 text-sm">Engagez vous au service de la nation.</span>
            <div className="flex flex-col justify-center gap-4 my-6">
              <Link to="/mission" className="text-sm bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md px-3 py-2.5 text-center line-clamp-1">
                <HiSearch className="inline-block mr-2 text-xl align-text-bottom" />
                Trouver un engagement
              </Link>
              <Link to="/phase2/equivalence" className="text-sm border rounded-md px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors text-center">
                <HiPlus className="inline-block mr-2 text-xl align-text-bottom" />
                Ajouter un engagement réalisé
              </Link>
            </div>
          </span>
        )}
      </div>

      {equivalences.isError ||
        (applications.isError && (
          <div className="mt-8 mb-4 max-w-6xl px-3 mx-auto">
            <div className="p-12 bg-white rounded-lg shadow-sm">
              <p className="text-center text-gray-500">Erreur lors du chargement des engagements&nbsp;🥲</p>
            </div>
          </div>
        ))}

      {missionDoneCards && (
        <div className="pt-8 mt-8">
          <span className="font-bold text-2xl">
            Engagements Réalisés
            <Link to="/phase2/equivalence" className="ml-4 text-sm font-normal bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md px-3 py-2.5 text-center">
              <HiPlus className="inline-block mr-2 text-xl align-text-bottom" />
              Ajouter
            </Link>
          </span>
          <div className="flex flex-col md:flex-row gap-3 pb-3 flex-wrap pt-4">
            {missionDoneCards.map((data) =>
              data.engagementType === "mig" ? <ApplicationCard key={data._id} application={data} /> : <EquivalenceCard key={data._id} equivalence={data} />,
            )}
          </div>
        </div>
      )}

      {missionCandidateCards && (
        <div className="pt-8 mt-8">
          <span className="font-bold text-2xl">Candidatures</span>
          <div className="flex flex-col md:flex-row gap-3 pb-3 flex-wrap pt-4">
            {missionCandidateCards.map((data) => (
              <ApplicationCard key={data._id} application={data} />
            ))}
          </div>
        </div>
      )}

      <div className="pt-8 mt-8">
        <span className="font-bold text-2xl">Préparations Militaires</span>
      </div>
    </div>
  );
}

import React from "react";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import { supportURL } from "@/config";
import { PHASE2_TOTAL_HOURS, APPLICATION_STATUS } from "snu-lib";
import { useQuery } from "@tanstack/react-query";
import useAuth from "@/services/useAuth";
import { HiPlus, HiSearch } from "react-icons/hi";
import { RiMedal2Line } from "react-icons/ri";
import InfobulleIcon from "@/assets/infobulleIcon.svg";
import SemiCircleProgress from "./SemiCircleProgress";
import EquivalenceCard from "./../../../components/EquivalenceCard";
import ApplicationCard from "./../../../components/ApplicationCard";
import { fetchApplications, fetchEquivalences } from "../../../engagement.repository";
import Loader from "@/components/Loader";
import MilitaryStatusBadge from "./../../../components/MilitaryStatusBadge";
import plausibleEvent from "@/services/plausible";

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

export default function View() {
  const { young } = useAuth();
  const phase2NumberHoursDone = young.phase2NumberHoursDone || 0;
  const applications = useQuery({ queryKey: ["application"], queryFn: () => fetchApplications(young._id) });
  const equivalences = useQuery({ queryKey: ["equivalence"], queryFn: () => fetchEquivalences(young._id) });

  if (equivalences.isPending || applications.isPending) {
    return <Loader />;
  }

  const missionsDone = [...applications.data.filter(({ status }) => [APPLICATION_STATUS.DONE, APPLICATION_STATUS.IN_PROGRESS].includes(status)), ...equivalences.data].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const applicationsInProgress = applications.data
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
    <>
      <section id="compteur" className="mt-[3rem] grid md:grid-flow-col border shadow-sm rounded-2xl border-gray-200 items-center p-3">
        <div className="w-full relative">
          <SemiCircleProgress current={phase2NumberHoursDone} total={PHASE2_TOTAL_HOURS}></SemiCircleProgress>
          <Tooltip
            className="absolute top-0 right-4"
            onMouseEnter={() => plausibleEvent("Phase2/Engagement/info-compteur")}
            onClick={() => plausibleEvent("Phase2/Engagement/info-compteur")}
          />
        </div>

        {missionsDone.length === 0 ? (
          <div className="flex flex-col sm:border-t md:h-full md:border-t-0 md:border-l text-center">
            <div className="mx-auto w-full md:w-auto">
              <p className="mt-[1rem] md:mt-14 text-2xl font-bold">C'est parti !</p>
              <p className="mt-1 text-gray-400 text-sm">Engagez vous au service de la nation.</p>
              <Link to="/mission">
                <p className="mt-3 bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md px-3 py-2.5 text-center mx-auto w-full">
                  <HiSearch className="inline-block mr-2 text-xl align-text-bottom" />
                  Trouver un engagement
                </p>
              </Link>
              <Link to="/phase2/equivalence">
                <p className="mt-3 border bg-white rounded-md px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors text-center mx-auto w-full">
                  <HiPlus className="inline-block mr-2 text-xl align-text-bottom" />
                  Ajouter un engagement réalisé
                </p>
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      {equivalences.isError || applications.isError ? (
        <div className="mt-8 mb-4 max-w-6xl px-3 mx-auto">
          <div className="p-12 bg-white rounded-lg shadow-sm">
            <p className="text-center text-gray-500">Erreur lors du chargement des engagements&nbsp;🥲</p>
          </div>
        </div>
      ) : null}

      {missionsDone.length ? (
        <section id="engagements-realises" className="mt-[2rem] md:mt-[3rem]">
          <div className="flex gap-4">
            <h2 className="font-bold text-2xl md:text-3xl ">Engagements réalisés</h2>
            {phase2NumberHoursDone < PHASE2_TOTAL_HOURS && (
              <Link to="/phase2/equivalence" onClick={() => plausibleEvent("Phase2/Engagement/CTA - Ajouter un engagement")}>
                <p className="text-sm font-normal bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-full md:rounded-md w-8 h-8 md:w-auto md:h-auto py-1.5 md:px-3 md:py-2.5 text-center">
                  <HiPlus className="inline-block text-lg align-text-bottom md:mr-1" />
                  <span className="hidden md:inline">Ajouter</span>
                </p>
              </Link>
            )}
          </div>
          <EngagementList cards={missionsDone} />

          <hr className="mt-[2rem] md:mt-[3rem]" />
        </section>
      ) : null}

      {applicationsInProgress.length ? (
        <section id="candidatures" className="mt-[2rem] md:mt-[3rem]">
          <h2 className="font-bold text-2xl md:text-3xl">Candidatures</h2>
          <EngagementList cards={applicationsInProgress} />
        </section>
      ) : null}

      <section id="preparations-militaires" className="mt-[2rem] md:mt-[3rem]">
        <h2 className="font-bold text-2xl md:text-3xl">Préparations Militaires</h2>
        <div className="mt-4 flex md:items-center gap-4 p-4 bg-gray-50 border shadow-sm rounded-xl">
          <div className="flex-none flex justify-center items-center bg-gray-200 rounded-full w-10 h-10">
            <RiMedal2Line className="text-xl" />
          </div>

          <div className="flex gap-2 flex-col-reverse md:flex-row justify-between md:w-full">
            <div>
              <p>Mon dossier d'éligibilité</p>
              <Link className="text-blue-600" to="/ma-preparation-militaire">
                {young.statusMilitaryPreparationFiles ? "Consulter" : "Compléter"}
              </Link>
            </div>
            <div>{young.statusMilitaryPreparationFiles ? <MilitaryStatusBadge status={young.statusMilitaryPreparationFiles} /> : null}</div>
          </div>
        </div>
      </section>
    </>
  );
}

function EngagementList({ cards }) {
  const [open, setOpen] = React.useState(false);
  const cardsToDisplay = open ? cards : cards.slice(0, 3);
  return (
    <div className="mt-[1rem] md:mt-[2rem]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8">
        {cardsToDisplay.map((data) =>
          data.engagementType === "mig" ? <ApplicationCard key={data._id} application={data} /> : <EquivalenceCard key={data._id} equivalence={data} />,
        )}
      </div>
      {cards.length > 3 ? (
        <div className="mt-2 flex justify-center">
          <button onClick={() => setOpen(!open)} className="text-center underline underline-offset-2 mt-4 text-gray-600 text-sm">
            {open ? "Réduire" : "Afficher tout"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

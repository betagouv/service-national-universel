import React from "react";
import { Link } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { HiArrowRight } from "react-icons/hi";
import { getCohortPeriod, getCohortYear } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import { getCohort } from "@/utils/cohorts";
import Loader from "@/components/Loader";
import { supportURL } from "@/config";
import NoSejourSection from "../components/NoSejourSection";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import useReinscription from "../lib/useReinscription";
import useSejours from "../lib/useSejours";
import Container from "@/components/layout/Container";

export default function ChangeSejour() {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);
  const { data: isReinscriptionOpen, isLoading: isReinscriptionOpenLoading } = useReinscription();
  const { data: sessions, isPending, isError } = useSejours();

  if (isError) return <div>Erreur</div>;
  if (isPending || isReinscriptionOpenLoading) return <Loader />;

  return (
    <Container title="Changer de séjour" backlink="/home">
      <CurrentSejourNotice />

      {sessions.length > 0 && (
        <section id="changement-de-sejour" className="w-full flex flex-col">
          <h2 className="text-base leading-6 font-bold text-center mt-4">S'inscrire à un autre séjour en {getCohortYear(cohort)}</h2>
          <p className="text-sm leading-5 font-normal text-[#6B7280] mt-2 text-center">Séjour auxquels vous êtes éligible :</p>
          <div className="grid mt-2">
            {sessions.map((session) => (
              <Link
                to={`/changer-de-sejour/motif?cohortid=${session._id}&period=${getCohortPeriod(session)}&isFull=${session.isFull}`}
                key={session._id}
                className="mt-2 flex p-3 justify-between rounded-md border border-gray-500 w-full">
                <p className="text-sm leading-5 font-medium capitalize">{getCohortPeriod(session)}</p>
                <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
              </Link>
            ))}
          </div>
          <a
            href={supportURL + "/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion"}
            className="text-sm leading-8 font-normal text-[#6B7280] mt-2 text-center underline"
            target="_blank"
            rel="noreferrer">
            Pourquoi je ne vois pas tous les séjours ?
          </a>
        </section>
      )}

      {isReinscriptionOpen === true && (
        <section id="reinscription">
          <h2 className="text-base leading-6 font-bold text-center mt-8">S'inscrire pour 2025</h2>
          <p className="text-sm leading-5 font-normal text-gray-700 mt-2 text-center">Mettez à jour vos informations et choisissez un séjour.</p>
          <div className="flex w-full mt-4">
            <Link
              to="/reinscription"
              className="w-full text-center rounded-md bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-300 ease-in-out hover:bg-blue-800"
              onClick={() => plausibleEvent("Phase0/CTA reinscription - home page")}>
              Vérifier mon éligibilité
            </Link>
          </div>
        </section>
      )}

      {isReinscriptionOpen === true || sessions.length > 0 ? (
        <Link to="/changer-de-sejour/no-date" className="mt-8 flex p-3 justify-between rounded-md border border-gray-500 w-full">
          <p className="text-sm leading-5 font-medium">Aucune date ne me convient</p>
          <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
        </Link>
      ) : (
        <NoSejourSection />
      )}
    </Container>
  );
}

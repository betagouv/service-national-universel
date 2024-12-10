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
import useCohortGroups from "../lib/useCohortGroups";
import useSejours from "../lib/useSejours";
import ChangeSejourContainer from "../components/ChangeSejourContainer";
import { capitalizeFirstLetter } from "@/scenes/inscription2023/steps/stepConfirm";

export default function ChangeSejour() {
  const { young } = useAuth();
  const cohort = getCohort(young.cohort);
  const groups = useCohortGroups();
  const cohorts = useSejours();

  return (
    <ChangeSejourContainer title="Choisir un nouveau séjour" backlink="/home">
      {groups.isError || cohorts.isError ? (
        <div>Erreur</div>
      ) : groups.isPending || cohorts.isPending ? (
        <div className="mt-12">
          <Loader />
        </div>
      ) : (
        <>
          {cohorts.data.length > 0 && (
            <section id="changement-de-sejour" className="text-center">
              <h2 className="text-base font-bold mt-4 md:text-2xl">S'inscrire à un autre séjour en {getCohortYear(cohort)}</h2>
              <p className="text-sm leading-loose font-normal text-gray-500 mt-1">Séjours auxquels vous êtes éligible&nbsp;:</p>
              <div className="grid my-3 rounded-md border divide-y">
                {cohorts.data.map((session) => (
                  <Link
                    to={`/changer-de-sejour/motif?cohortid=${session._id}&cohortName=${session.name}&period=${getCohortPeriod(session)}`}
                    key={session._id}
                    className="flex p-3 justify-between w-full">
                    <p className="text-sm leading-5 font-medium">{capitalizeFirstLetter(getCohortPeriod(session))}</p>
                    <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
                  </Link>
                ))}
              </div>
              <a
                href={supportURL + "/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion"}
                className="text-sm leading-8 font-normal text-gray-500 mt-2 underline underline-offset-2"
                target="_blank"
                rel="noreferrer">
                Pourquoi je ne vois pas tous les séjours&nbsp;?
              </a>
            </section>
          )}

          {groups.data.map((group) => (
            <section id={`reinscription_${group.year}`} key={group._id}>
              <h2 className="text-base font-bold text-center mt-8 md:text-2xl">S'inscrire pour {group.year}</h2>
              <p className="text-sm leading-5 font-normal text-gray-500 mt-2 text-center">Mettez à jour vos informations et choisissez un séjour.</p>
              <div className="flex w-full mt-4">
                <Link
                  to="/reinscription"
                  className="w-full text-center rounded-md bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-300 ease-in-out hover:bg-blue-800"
                  onClick={() => plausibleEvent("Phase0/CTA reinscription - home page")}>
                  Vérifier mon éligibilité
                </Link>
              </div>
            </section>
          ))}

          {groups.data.length > 0 || cohorts.data.length > 0 ? (
            <Link to="/changer-de-sejour/no-date" className="mt-8 flex p-3 justify-between rounded-md border border-gray-500 w-full">
              <p className="text-sm leading-5 font-medium">Aucune date ne me convient</p>
              <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
            </Link>
          ) : (
            <NoSejourSection />
          )}
        </>
      )}
    </ChangeSejourContainer>
  );
}

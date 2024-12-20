import React from "react";
import { Link } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { HiArrowRight } from "react-icons/hi";
import { CohortGroupType, CohortType, getCohortPeriod, getCohortYear } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import Loader from "@/components/Loader";
import { knowledgebaseURL } from "@/config";
import NoSejourSection from "../components/NoSejourSection";
import useCohortGroups from "../lib/useCohortGroups";
import useSejours from "../lib/useSejours";
import ChangeSejourContainer from "../components/ChangeSejourContainer";
import { capitalizeFirstLetter } from "@/scenes/inscription2023/steps/stepConfirm";
import usePermissions from "@/hooks/usePermissions";
import { useLocation } from "react-router-dom";
import ErrorNotice from "@/components/ui/alerts/ErrorNotice";
import useCohort from "@/services/useCohort";

export default function ChangeSejour() {
  const groups = useCohortGroups();
  const cohorts = useSejours();
  const { hasAccessToAVenir, hasAccessToDesistement } = usePermissions();
  const location = useLocation<{ backlink?: string }>();
  const backlink = location.state?.backlink || "/phase1";

  return (
    <ChangeSejourContainer title="Choisir un nouveau séjour" backlink={backlink}>
      {groups.isError || cohorts.isError ? (
        <div className="mt-12">
          <ErrorNotice text="Impossible de charger les séjours. Merci de réessayer plus tard." />
        </div>
      ) : groups.isPending || cohorts.isPending ? (
        <div className="mt-12">
          <Loader />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8">
          {cohorts.data.length > 0 && <Sejours cohorts={cohorts.data} />}
          {groups.data.map((group) => (
            <Reinscription group={group} key={group._id} />
          ))}
          {(hasAccessToAVenir || hasAccessToDesistement) && <LinkToNextStep groups={groups} cohorts={cohorts} />}
        </div>
      )}
    </ChangeSejourContainer>
  );
}

function Sejours({ cohorts }: { cohorts: CohortType[] }) {
  const { cohort } = useCohort();
  return (
    <section id="changement-de-sejour" className="text-center">
      <h2 className="text-base font-bold md:text-2xl">S'inscrire à un autre séjour en {getCohortYear(cohort)}</h2>
      <p className="text-sm leading-loose font-normal text-gray-500 mt-1">Séjours auxquels vous êtes éligible&nbsp;:</p>
      <div className="grid my-3 rounded-md border divide-y">
        {cohorts.map((cohort) => (
          <SejourLink cohort={cohort} key={cohort._id} />
        ))}
      </div>
      <a
        href={knowledgebaseURL + "/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion"}
        className="text-sm leading-8 font-normal text-gray-500 mt-2 underline underline-offset-2"
        target="_blank"
        rel="noreferrer">
        Pourquoi je ne vois pas tous les séjours&nbsp;?
      </a>
    </section>
  );
}

function SejourLink({ cohort }: { cohort: CohortType }) {
  return (
    <Link to={`/changer-de-sejour/motif?cohortid=${cohort._id}&cohortName=${cohort.name}&period=${getCohortPeriod(cohort)}`} className="flex p-3 justify-between w-full">
      <p className="text-sm leading-5 font-medium">{capitalizeFirstLetter(getCohortPeriod(cohort))}</p>
      <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
    </Link>
  );
}

function Reinscription({ group }: { group: CohortGroupType }) {
  return (
    <section id={`reinscription_${group.year}`} key={group._id}>
      <h2 className="text-base font-bold text-center md:text-2xl">S'inscrire pour {group.year}</h2>
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
  );
}

function LinkToNextStep({ groups, cohorts }: { groups: { data: CohortGroupType[] }; cohorts: { data: CohortType[] } }) {
  if (groups.data.length > 0 || cohorts.data.length > 0) {
    return (
      <Link to="/changer-de-sejour/no-date" className="flex p-3 justify-between rounded-md border border-gray-500 w-full">
        <p className="text-sm leading-5 font-medium">Aucune date ne me convient</p>
        <HiArrowRight className="text-blue-500 mt-0.5 mr-2" />
      </Link>
    );
  }
  return <NoSejourSection />;
}

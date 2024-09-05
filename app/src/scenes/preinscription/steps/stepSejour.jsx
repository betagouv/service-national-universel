import React from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { getCohortPeriod, GRADES } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import Alert from "../../../components/dsfr/ui/Alert";
import { supportURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { PREINSCRIPTION_STEPS, REINSCRIPTION_STEPS } from "../../../utils/navigation";
import ProgressBar from "../components/ProgressBar";
import plausibleEvent from "@/services/plausible";
import { SignupButtons } from "@snu/ds/dsfr";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

export default function StepSejour() {
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const [route, context, bdcURI] = isLoggedIn
    ? ["/reinscription/", ReinscriptionContext, "jetais-inscrit-en-2023-comment-me-reinscrire-en-2024"]
    : ["/preinscription/", PreInscriptionContext, "je-me-preinscris-et-cree-mon-compte-volontaire"];
  const history = useHistory();
  const [data] = React.useContext(context);
  const { scolarity } = data;

  return (
    <>
      <ProgressBar isReinscription={isLoggedIn} />
      <DSFRContainer title="Choisissez la date du séjour" supportLink={supportURL + `/base-de-connaissance/${bdcURI}`} supportEvent="Phase0/aide preinscription - sejour">
        <div className="my-2 font-semibold">Séjours de cohésion disponibles</div>
        <div className="text-sm text-gray-500">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
        {scolarity === GRADES["1ereGT"] && (
          <Notice
            className="mt-4"
            onClose={function noRefCheck() {}}
            title="En cas de convocation après le 3 juillet aux épreuves du baccalauréat, vous pourrez rejoindre le centre SNU de votre département."
          />
        )}
        <div className="my-4">
          {data.sessions?.map((e) => (
            <SessionButton key={e.name} session={e} />
          ))}
        </div>
        <div className="py-2 font-semibold">Pourquoi je ne vois pas tous les séjours ?</div>
        <div className="text-sm text-gray-500">
          La proposition des séjours dépend de vos caractéristiques personnelles (âge, situation scolaire ou professionnelle, localisation).{" "}
          <a href={`${supportURL}/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion`} target="_blank" rel="noreferrer">
            En savoir plus.
          </a>
        </div>
        <div className="my-4 text-[#000091] underline underline-offset-4">
          <Link to="/public-engagements" target="_blank" rel="noopener noreferrer">
            Consulter d’autres dispositifs d’engagement
          </Link>
        </div>
        <SignupButtons onClickPrevious={() => history.push(route)} />
      </DSFRContainer>
    </>
  );
}

function SessionButton({ session }) {
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const [route, context, step] = isLoggedIn
    ? ["/reinscription/confirm", ReinscriptionContext, REINSCRIPTION_STEPS.CONFIRM]
    : ["/preinscription/profil", PreInscriptionContext, PREINSCRIPTION_STEPS.PROFIL];
  const history = useHistory();
  const [data, setData] = React.useContext(context);
  const eventName = `Phase0/CTA ${isLoggedIn ? "reinscription" : "preinscription"} - sejour ${session.name}`;

  function handleClick() {
    setData({ ...data, cohort: session.name, source: session.type, step });
    plausibleEvent(eventName);
    history.push(route);
  }

  return (
    <button key={session.id} onClick={handleClick} className="w-full my-3 flex items-center justify-between border p-4 hover:bg-gray-50">
      <span>
        Séjour <strong>{getCohortPeriod(session)}</strong>
      </span>
      <ArrowRightBlueSquare />
    </button>
  );
}

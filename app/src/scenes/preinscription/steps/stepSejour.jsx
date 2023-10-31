import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getCohortPeriod } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import { supportURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { PREINSCRIPTION_STEPS, REINSCRIPTION_STEPS } from "../../../utils/navigation";
import ProgressBar from "../components/ProgressBar";

export default function StepSejour() {
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const [route, context, bdcURI] = isLoggedIn
    ? ["/reinscription/", ReinscriptionContext, "jetais-inscrit-en-2023-comment-me-reinscrire-en-2024"]
    : ["/preinscription/", PreInscriptionContext, "je-me-preinscris-et-cree-mon-compte-volontaire"];
  const history = useHistory();
  const [data] = React.useContext(context);

  return (
    <>
      <ProgressBar />
      <DSFRContainer title="Choisissez la date du séjour" supportLink={supportURL + `/base-de-connaissance/${bdcURI}`}>
        <div className="my-2 font-semibold">Séjours de cohésion disponibles</div>
        <div className="text-sm text-gray-500">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
        <div className="my-4">{data.sessions?.map((e) => SessionButton(e))}</div>
        {/* {data.sessions?.length < 3 && (
        <>
          <div className="py-2 font-semibold">Pourquoi je ne vois pas tous les séjours ?</div>
          <div className="text-sm text-gray-500">
            La proposition des séjours dépend de vos caractéristiques personnelles (âge, situation scolaire ou professionnelle, localisation).{" "}
            <a href={`${supportURL}/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              En savoir plus.
            </a>
          </div>
          <div className="my-4 text-[#000091] underline underline-offset-4">
            <Link to="/public-engagements">Consulter d’autres dispositifs d’engagement</Link>
          </div>
        </>
      )} */}
        <SignupButtonContainer onClickPrevious={() => history.push(route)} />
      </DSFRContainer>
    </>
  );
}

function SessionButton(session) {
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const [route, context, step] = isLoggedIn
    ? ["/reinscription/confirm", ReinscriptionContext, REINSCRIPTION_STEPS.CONFIRM]
    : ["/preinscription/profil", PreInscriptionContext, PREINSCRIPTION_STEPS.PROFIL];
  const history = useHistory();
  const [data, setData] = React.useContext(context);

  return (
    <div
      key={session.id}
      className="my-3 flex cursor-pointer items-center justify-between border p-4 hover:bg-gray-50"
      onClick={() => {
        setData({ ...data, cohort: session.name, step });
        history.push(route);
      }}>
      <div>
        Séjour <strong>{getCohortPeriod(session)}</strong>
      </div>
      <ArrowRightBlueSquare />
    </div>
  );
}

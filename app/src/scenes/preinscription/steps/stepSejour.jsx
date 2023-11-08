import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getCohortPeriod, GRADES } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import Alert from "../../../components/dsfr/ui/Alert";
import { supportURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { PREINSCRIPTION_STEPS, REINSCRIPTION_STEPS } from "../../../utils/navigation";
import ProgressBar from "../components/ProgressBar";
import plausibleEvent from "@/services/plausible";

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
        {scolarity == GRADES["1ereGT"] && (
          <Alert className="my-4">En cas de convocation après le 2 juillet aux épreuves du baccalauréat, vous pourrez rejoindre le centre SNU de votre département.</Alert>
        )}
        <div className="my-4">{data.sessions?.map((e) => SessionButton(e))}</div>
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
  const eventName = `Phase0/CTA ${isLoggedIn ? "reinscription" : "preinscription"} - sejour ${session.name}`;

  function handleClick() {
    setData({ ...data, cohort: session.name, step });
    plausibleEvent(eventName);
    history.push(route);
  }

  return (
    <button key={session.id} onClick={handleClick} className="w-full my-3 flex items-center justify-between border p-4 hover:bg-gray-50">
      <p>
        Séjour <strong>{getCohortPeriod(session)}</strong>
      </p>
      <ArrowRightBlueSquare />
    </button>
  );
}

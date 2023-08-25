import React from "react";
import { Link, useHistory } from "react-router-dom";
import { formatStringDate } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import { supportURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import plausibleEvent from "../../../services/plausible";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";
import ProgressBar from "../components/ProgressBar";

export default function StepSejour() {
  const history = useHistory();
  const [data] = React.useContext(PreInscriptionContext);

  return (
    <>
      <ProgressBar />
      <DSFRContainer title="Choisissez la date du séjour">
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
        <SignupButtonContainer onClickPrevious={() => history.push("/preinscription/")} />
      </DSFRContainer>
    </>
  );
}

function SessionButton(session) {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const history = useHistory();
  return (
    <div
      key={session.id}
      className="my-3 flex cursor-pointer items-center justify-between border p-4 hover:bg-gray-50"
      onClick={() => {
        setData({ ...data, cohort: session.name, step: PREINSCRIPTION_STEPS.PROFIL });
        plausibleEvent(session.event);
        history.push("/preinscription/profil");
      }}>
      <div>
        Séjour du <strong>{formatStringDate(session.dateStart).slice(0, -5)}</strong> au <strong>{formatStringDate(session.dateEnd).slice(0, -5)}</strong> 2023
      </div>
      <ArrowRightBlueSquare />
    </div>
  );
}

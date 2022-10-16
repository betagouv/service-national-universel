import React from "react";
import { useHistory } from "react-router-dom";
import { formatStringDate } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Footer from "../../../components/footerV2";
import { supportURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import plausibleEvent from "../../../services/plausible";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";

function SessionButton(session) {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const history = useHistory();
  return (
    <div
      key={session.id}
      className="border p-4 my-3 flex justify-between items-center"
      onClick={() => {
        setData({ ...data, cohort: session.name });
        plausibleEvent(session.event);
        setData({ ...data, step: PREINSCRIPTION_STEPS.PROFIL });
        history.push("/preinscription/profil");
      }}>
      <div>
        Séjour du <strong>{formatStringDate(session.dateStart).slice(0, -5)}</strong> au <strong>{formatStringDate(session.dateEnd).slice(0, -5)}</strong> 2023
      </div>
      <ArrowRightBlueSquare />
    </div>
  );
}

export default function StepSejour() {
  const [data] = React.useContext(PreInscriptionContext);

  return (
    <>
      <div className="bg-white p-4">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Choisissez la date du séjour</h1>
          <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="font-semibold my-2">Séjours de cohésion disponibles</div>
        <div className="text-gray-500 text-sm">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
        <div className="my-4">{data.sessions?.map((e) => SessionButton(e))}</div>
        {data.sessions?.length < 3 && (
          <>
            <div className="font-semibold py-2">Pourquoi je ne vois pas tous les séjours ?</div>
            <div className="text-gray-500 text-sm">
              La proposition des séjours dépend de vos caractéristiques personnelles (âge, situation scolaire ou professionnelle, localisation).{" "}
              <a href={`${supportURL}/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                En savoir plus.
              </a>
            </div>
            <div className="text-[#000091] my-4 underline underline-offset-4">
              <a href={`${supportURL}/base-de-connaissance/les-autres-formes-d-engagement`} target="_blank" rel="noreferrer">
                Consulter d’autres dispositifs d’engagement
              </a>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

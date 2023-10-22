import React from "react";
import { useHistory } from "react-router-dom";
import { formatStringDate } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import { supportURL } from "../../../config";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import plausibleEvent from "../../../services/plausible";
import ProgressBar from "../components/ProgressBar";
import { REINSCRIPTION_STEPS } from "../../../utils/navigation";

export default function StepSejour() {
  const history = useHistory();
  const [data] = React.useContext(ReinscriptionContext);
  return (
    <>
      <ProgressBar />
      <DSFRContainer title="Choisissez la date du séjour" supportLink={supportURL + "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"}>
        <div className="my-2 font-semibold">Séjours de cohésion disponibles</div>
        <div className="text-sm text-gray-500">Veuillez vous assurer d’être disponible sur l’ensemble de la période.</div>
        <div className="my-4">{data.sessions?.map((e) => SessionButton(e))}</div>
        <SignupButtonContainer onClickPrevious={() => history.push("/reinscription/")} />
      </DSFRContainer>
    </>
  );

  
}

function SessionButton(session) {
  const [data, setData] = React.useContext(ReinscriptionContext);
  const history = useHistory();
  return (
    <div
      key={session.id}
      className="my-3 flex cursor-pointer items-center justify-between border p-4 hover:bg-gray-50"
      onClick={() => {
        setData({ ...data, cohort: session.name, step: REINSCRIPTION_STEPS.CONFIRM, status: "REINSCRIPTION" });
        plausibleEvent(session.event);
        history.push("/reinscription/confirm");
      }}>
      <div>
        Séjour du <strong>{formatStringDate(session.dateStart).slice(0, -5)}</strong> au <strong>{formatStringDate(session.dateEnd).slice(0, -5)}</strong> 2023
      </div>
      <ArrowRightBlueSquare />
    </div>
  );
}

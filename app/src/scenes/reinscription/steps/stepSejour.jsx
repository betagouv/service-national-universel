import React from "react";
import { useHistory } from "react-router-dom";
import { getCohortPeriod } from "snu-lib";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import { supportURL } from "../../../config";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import plausibleEvent from "../../../services/plausible";
import ProgressBar from "../components/ProgressBar";
import { INSCRIPTION_STEPS, REINSCRIPTION_STEPS } from "../../../utils/navigation";
import API from "@/services/api";
import { toastr } from "react-redux-toastr";

export default function StepSejour() {
  const history = useHistory();
  const [data] = React.useContext(ReinscriptionContext);
  return (
    <>
      <ProgressBar />
      <DSFRContainer title="Choisissez la date du séjour" supportLink={supportURL + "/base-de-connaissance/jetais-inscrit-en-2023-comment-me-reinscrire-en-2024"}>
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

  async function handleClick() {
    const { ok, code } = await API.put("/young/inscription2023/step", { step: INSCRIPTION_STEPS.CONFIRM });
    if (!ok) return toastr.error("Impossible de mettre à jour votre inscription", code);
    plausibleEvent(session.event.replace("inscription", "reinscription"));
    setData({ ...data, cohort: session.name, step: REINSCRIPTION_STEPS.CONFIRM, status: "REINSCRIPTION" });
    history.push("/reinscription/confirm");
  }

  return (
    <div key={session.id} className="my-3 flex cursor-pointer items-center justify-between border p-4 hover:bg-gray-50" onClick={handleClick}>
      <div>
        Séjour <strong>{getCohortPeriod(session)}</strong>
      </div>
      <ArrowRightBlueSquare />
    </div>
  );
}

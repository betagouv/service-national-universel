import React, { useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { Modal } from "reactstrap";
import CloseSvg from "../../../../../../assets/Close";
import { ModalContainer } from "../../../../../../components/modals/Modal";
import { setYoung } from "../../../../../../redux/auth/actions";
import api from "../../../../../../services/api";
import { transportDatesToString } from "snu-lib";
import plausibleEvent from "../../../../../../services/plausible";
import { isStepAgreementDone, isStepPDRDone } from "../../utils/steps.utils";

export default function StepAgreement({ departureDate, returnDate }) {
  const young = useSelector((state) => state.Auth.young);
  const [stateMobil, setStateMobil] = useState(false);
  const valid = isStepAgreementDone(young);
  const enabled = isStepPDRDone(young);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, ok } = await api.put(`/young/phase1/agreement`, { youngPhase1Agreement: "true" });
    if (!ok) return toastr.error("Une erreur est survenue lors de la validation de votre engagement");
    toastr.success("Votre engagement a bien été enregistré");
    plausibleEvent("affecté_step2");
    dispatch(setYoung(data));
    setStateMobil(false);
  };

  return (
    <>
      <div
        className={`mb-3 ml-4 flex h-36 cursor-pointer items-center rounded-xl border-[1px] ${valid ? "border-green-500 bg-green-50" : "bg-white"} `}
        onClick={() => setStateMobil(enabled ? !stateMobil : false)}>
        <div className="flex w-full -translate-x-5 flex-row items-center">
          {valid ? (
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
              <BsCheck2 className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-[1px] border-gray-200 bg-white text-gray-700">2</div>
          )}
          <div className="ml-3 flex flex-1 flex-col">
            <div className={`text-sm ${valid && "text-green-600"} ${enabled ? "text-gray-900" : "text-gray-400"}`}>Confirmez votre participation au séjour</div>
            <div className={` text-sm leading-5 ${valid && "text-green-600 opacity-70"} ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Vous devez confirmer votre participation au séjour avant votre départ.
            </div>
            {!valid && enabled ? <div className="text-right text-sm leading-5 text-blue-600">Commencer</div> : null}
          </div>
        </div>
      </div>
      {stateMobil && (
        <Modal centered isOpen={stateMobil} toggle={() => setStateMobil(false)} size="lg">
          <ModalContainer>
            <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={() => setStateMobil(false)} />
            <div className="w-full p-4">
              <h1 className="pb-1 text-center text-xl text-gray-900">Confirmez votre participation au séjour</h1>
              <p className="pb-4 text-center text-base text-gray-500">Vous devez confirmer votre participation au séjour avant votre départ.</p>
              {content({ handleSubmit, young, departureDate, returnDate })}
            </div>
          </ModalContainer>
        </Modal>
      )}
    </>
  );
}

const content = ({ handleSubmit, young, departureDate, returnDate }) => {
  const isFromDOMTOM = () => {
    return (
      (["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Saint-Pierre-et-Miquelon", "Mayotte", "Saint-Martin", "Polynésie française", "Nouvelle-Calédonie"].includes(
        young.department,
      ) ||
        young.region === "Corse") &&
      young.grade !== "Terminale"
    );
  };
  return (
    <div className="mb-2 flex flex-shrink flex-col flex-wrap justify-center gap-6 p-2 lg:flex-row items-center">
      <div className="flex flex-col justify-between rounded-2xl border-[1px] border-blue-600 py-5 px-5 shadow-sm w-80 h-80">
        <h1 className="pb-4 text-xl font-bold leading-7">Je confirme</h1>
        <div className="text-sm text-gray-600">
          <p className="pb-2">
            • <strong>Participer</strong> au séjour
          </p>
          <p className="pb-2">
            • Avoir pris connaissance de mon <strong>affectation</strong>
          </p>
          {!isFromDOMTOM ? (
            <p className="pb-2">
              • Avoir pris connaissance de mon <strong>point de rassemblement </strong>
            </p>
          ) : null}
        </div>
        <button
          className="mt-auto justify-self-end rounded-md bg-blue-600 px-4 py-1.5 text-white hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:bg-blue-300 disabled:hover:scale-100"
          disabled={young?.youngPhase1Agreement === "true"}
          onClick={handleSubmit}>
          Valider
        </button>
      </div>

      <div className="rounded-2xl border-[1px] border-gray-100 py-5 px-5 shadow-sm w-80 h-80">
        <h1 className="pb-4 text-xl font-bold leading-7">J&apos;ai changé d&apos;avis</h1>
        <p className="pb-3 text-sm text-gray-600">Les dates ne me conviennent plus ({transportDatesToString(departureDate, returnDate)})</p>
        <Link to="/changer-de-sejour" className="whitespace-nowrap pb-4 text-sm text-blue-600 hover:underline hover:underline-offset-2">
          Changer de séjour &gt;
        </Link>
        <p className="pb-3 text-sm text-gray-600">Je ne souhaite plus participer au SNU</p>
        <Link to="account/general?desistement=1" className="whitespace-nowrap text-sm text-blue-600 hover:underline hover:underline-offset-2">
          Me désister &gt;
        </Link>
      </div>
    </div>
  );
};

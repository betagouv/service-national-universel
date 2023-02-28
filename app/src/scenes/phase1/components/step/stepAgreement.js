import React, { useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { Modal } from "reactstrap";
import CloseSvg from "../../../../assets/Close";
import { ModalContainer } from "../../../../components/modals/Modal";
import { setYoung } from "../../../../redux/auth/actions";
import api from "../../../../services/api";
import { translateCohort } from "../../../../utils";
import plausibleEvent from "../../../../services/plausible";

export default function StepAgreement({ young }) {
  const [stateDesktop, setStateDesktop] = useState(false);
  const [stateMobil, setStateMobil] = useState(false);
  const valid = young?.youngPhase1Agreement === "true";
  const enabled = young?.meetingPointId !== null || young?.deplacementPhase1Autonomous === "true" || young?.transportInfoGivenByLocal === "true";
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, ok } = await api.put(`/young/phase1/agreement`, { youngPhase1Agreement: "true" });
    if (!ok) return toastr.error("Une erreur est survenue lors de la validation de votre engagement");
    toastr.success("Votre engagement a bien été enregistré");
    plausibleEvent("affecté_step2");
    dispatch(setYoung(data));
    setStateDesktop(false);
    setStateMobil(false);
  };

  return (
    <>
      {/* Desktop */}
      <div className={`hidden md:flex flex-row items-center justify-between ${enabled && "cursor-pointer"}`} onClick={() => setStateDesktop(enabled ? !stateDesktop : false)}>
        <div className="flex flex-1 flex-row py-4 items-center">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full mr-4 border-[1px] border-gray-200 text-gray-700">2</div>
          )}
          <div className="flex flex-1 flex-col mx-3">
            <h1 className={`text-base leading-7 ${enabled ? "text-gray-900" : "text-gray-400"}`}>Confirmez votre participation au séjour</h1>
            <p className={`text-sm leading-5 ${enabled ? "text-gray-500" : "text-gray-400"}`}>Vous devez confirmer votre participation au séjour avant votre départ.</p>
          </div>
        </div>
        {enabled ? (
          stateDesktop ? (
            <div className="flex items-center justify-center bg-gray-100 h-9 w-9 rounded-full hover:scale-110">
              <HiOutlineChevronUp className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gray-100 h-9 w-9 rounded-full hover:scale-110">
              <HiOutlineChevronDown className="h-5 w-5" />
            </div>
          )
        ) : null}
      </div>
      {/* Mobile */}
      <div
        className={`md:hidden flex items-center border-[1px] mb-3 ml-4 rounded-xl h-36 cursor-pointer ${valid ? "border-green-500 bg-green-50" : "bg-white"} `}
        onClick={() => setStateMobil(enabled ? !stateMobil : false)}>
        <div className="-translate-x-5 flex flex-row items-center w-full">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full border-[1px] bg-white border-gray-200 text-gray-700">2</div>
          )}
          <div className="flex flex-1 flex-col ml-3">
            <div className={`text-sm ${valid && "text-green-600"} ${enabled ? "text-gray-900" : "text-gray-400"}`}>Confirmez votre participation au séjour</div>
            <div className={` text-sm leading-5 ${valid && "text-green-600 opacity-70"} ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Vous devez confirmer votre participation au séjour avant votre départ.
            </div>
            {!valid && enabled ? <div className="text-blue-600 text-sm text-right leading-5">Commencer</div> : null}
          </div>
        </div>
      </div>
      {stateDesktop ? content({ handleSubmit, young }) : null}
      {stateMobil ? (
        <Modal centered isOpen={stateMobil} toggle={() => setStateMobil(false)} size="xl">
          <ModalContainer>
            <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={() => setStateMobil(false)} />
            <div className="w-full p-4">
              <h1 className="text-gray-900 text-xl text-center pb-1">Confirmez votre participation au séjour</h1>
              <p className="text-gray-500 text-base text-center pb-4">Vous devez confirmer votre participation au séjour avant votre départ.</p>
              {content({ handleSubmit, young })}
            </div>
          </ModalContainer>
        </Modal>
      ) : null}
    </>
  );
}

const content = ({ handleSubmit, young }) => {
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
    <div className="flex flex-col lg:flex-row p-2 mb-2 gap-6 items-center md:justify-start">
      <div className="flex flex-col border-[1px] border-blue-600 shadow-sm rounded-xl p-4 w-auto md:w-[300px] h-[300px]">
        <h1 className="text-xl leading-7 font-bold pb-4">Je confirme</h1>
        <div className="text-gray-600 text-sm">
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
          className="bg-blue-600 rounded-md px-4 py-1.5 mt-auto justify-self-end text-white hover:scale-105 hover:shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={young?.youngPhase1Agreement === "true"}
          onClick={handleSubmit}>
          Valider
        </button>
      </div>
      <div className="flex flex-col border-[1px] border-gray-100 shadow-sm rounded-xl p-4 md:w-[300px] h-[300px]">
        <h1 className="text-xl leading-7 font-bold pb-4">J&apos;ai changé d&apos;avis</h1>
        <p className="pb-3 text-sm text-gray-600">Les dates ne me conviennent plus ({translateCohort(young.cohort)})</p>
        <Link to="/changer-de-sejour" className="pb-4 text-sm text-blue-600 whitespace-nowrap hover:underline hover:underline-offset-2">
          Changer de séjour &gt;
        </Link>
        <p className="pb-3 text-sm text-gray-600">Je ne souhaite plus participer au SNU</p>
        <Link to="/desistement" className="text-sm text-blue-600 whitespace-nowrap hover:underline hover:underline-offset-2">
          Me désister &gt;
        </Link>
      </div>
    </div>
  );
};

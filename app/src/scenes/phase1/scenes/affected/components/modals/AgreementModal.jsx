import React from "react";
import { setYoung } from "@/redux/auth/actions";
import API from "@/services/api";
import plausibleEvent from "@/services/plausible";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { Modal } from "reactstrap";
import { isCle, transportDatesToString } from "snu-lib";
import Close from "@/components/layout/navbar/assets/Close";
import { ModalContainer } from "@/components/modals/Modal";

export function AgreementModal({ isOpen, setIsOpen, departureDate, returnDate }) {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, ok } = await API.put(`/young/phase1/agreement`, { youngPhase1Agreement: "true" });
      if (!ok) return toastr.error("Une erreur est survenue lors de la validation de votre engagement");
      toastr.success("Votre engagement a bien été enregistré");
      plausibleEvent("affecté_step2");
      dispatch(setYoung(data));
      setIsOpen(false);
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue lors de la validation de votre engagement");
    }
  };
  return (
    <Modal centered isOpen={isOpen} toggle={() => setIsOpen(false)} size="lg">
      <ModalContainer>
        <button onClick={() => setIsOpen(false)}>
          <Close className="close-icon" height={10} width={10} />
        </button>
        <div className="w-full p-4">
          <h1 className="pb-1 text-center text-xl text-gray-900">Confirmez votre participation au séjour</h1>
          <p className="pb-4 text-center text-base text-gray-500">Vous devez confirmer votre participation au séjour avant votre départ.</p>
          <div className="mb-2 flex flex-shrink flex-col flex-wrap justify-center gap-6 p-2 md:justify-start lg:flex-row">
            <div className="flex flex-col rounded-2xl border-[1px] border-blue-600 py-5 px-5 shadow-sm w-80">
              <h1 className="pb-4 text-xl font-bold leading-7">Je confirme</h1>
              <div className="text-sm text-gray-600">
                <p className="pb-2">
                  • <strong>Participer</strong> au séjour
                </p>
                <p className="pb-2">
                  • Avoir pris connaissance de mon <strong>affectation</strong>
                </p>
              </div>
              <button
                className="mt-auto justify-self-end rounded-md bg-blue-600 px-4 py-1.5 text-white hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:bg-blue-300 disabled:hover:scale-100"
                disabled={young?.youngPhase1Agreement === "true"}
                onClick={handleSubmit}>
                Valider
              </button>
            </div>
            {!isCle(young) && (
              <div className="flex flex-col rounded-2xl border-[1px] border-gray-100 py-5 px-5 shadow-sm w-80">
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
            )}
          </div>
        </div>
      </ModalContainer>
    </Modal>
  );
}

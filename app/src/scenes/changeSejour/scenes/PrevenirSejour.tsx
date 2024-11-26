import React, { useState } from "react";
import ReasonForm from "../components/ReasonForm";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import Container from "@/components/layout/Container";
import FullscreenModal from "@/components/modals/FullscreenModal";
import { getCohortPeriod, translate } from "snu-lib";
import { changeYoungCohort } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import { getCohort } from "@/utils/cohorts";
import { capitalizeFirstLetter } from "@/scenes/inscription2023/steps/stepConfirm";
import { HiOutlineXCircle } from "react-icons/hi2";
import { HiOutlineCheckCircle } from "react-icons/hi2";

export default function PrevenirSejour() {
  const dispatch = useDispatch();
  const { young } = useAuth();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const date = capitalizeFirstLetter(getCohortPeriod(getCohort(young.cohort)));
  const [loading, setLoading] = useState(false);

  const handleChangeCohort = async () => {
    const cohort = "à venir";
    setLoading(true);
    try {
      const { ok, data, code } = await changeYoungCohort(young._id, { reason, message, cohort });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      dispatch(setYoung(data));
      setLoading(false);
      history.push("/");
    } catch (error) {
      setLoading(false);
      toastr.error("Une erreur est survenue lors du changement de cohorte.", "");
    }
  };

  return (
    <Container title="M'alerter lors de l'ouverture des prochaines inscriptions" backlink="/changer-de-sejour/no-date">
      <CurrentSejourNotice />
      <p className="mt-4 mb-6 text-sm leading-5 text-gray-500 text-center font-normal">Vous serez alerté(e) par e-mail lors de l'ouverture des futures inscriptions.</p>
      <ReasonForm reason={reason} setReason={setReason} message={message} setMessage={setMessage} onSubmit={() => setOpen(true)} disabled={!reason || loading} />
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir changer de séjour ?">
        <p className="text-center text-gray-500 p-3">En confirmant, vous vous désisterez du séjour sur lequel vous êtes déjà positionné.</p>
        <div className="grid gap-2 p-3">
          <div className="bg-gray-100 p-2 rounded-xl text-center">
            <HiOutlineXCircle className="text-red-600 h-6 w-6 inline-block" />
            <p className="text-gray-500 leading-6">Ancien séjour</p>
            <p className="text-gray-900 leading-6 font-medium">{date}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-xl text-center">
            <HiOutlineCheckCircle className="text-blue-600 h-6 w-6 inline-block" />
            <p className="text-gray-500 leading-6">Nouveau séjour</p>
            <p className="text-gray-900 leading-6 font-medium">Être alerté(e) lors de l’ouverture des inscriptions pour les prochains séjours</p>
          </div>
        </div>
        <div className="absolute bottom-0 w-full p-3 grid gap-3 bg-gray-50">
          <button onClick={handleChangeCohort} className="w-full text-sm bg-blue-600 text-white p-2 rounded-md">
            Oui, confirmer ce choix
          </button>
          <button onClick={() => setOpen(false)} className="w-full text-sm border bg-white text-gray-500 p-2 rounded-md">
            Non, annuler
          </button>
        </div>
      </FullscreenModal>
    </Container>
  );
}

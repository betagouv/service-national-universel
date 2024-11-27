import React, { useState } from "react";
import ReasonForm from "../components/ReasonForm";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import ChangeSejourContainer from "../components/ChangeSejourContainer";
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
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  return (
    <ChangeSejourContainer title="M'alerter lors de l'ouverture des prochaines inscriptions" backlink="/changer-de-sejour/no-date">
      <p className="mt-4 mb-6 text-sm leading-5 text-gray-500 text-center font-normal">Vous serez alerté(e) par e-mail lors de l'ouverture des futures inscriptions.</p>
      <ReasonForm reason={reason} setReason={setReason} message={message} setMessage={setMessage} onSubmit={() => setOpen(true)} disabled={!reason} />
      <Modal open={open} setOpen={setOpen} reason={reason} message={message} />
    </ChangeSejourContainer>
  );
}

function Modal({ open, setOpen, reason, message }) {
  const { young } = useAuth();
  const history = useHistory();
  const dispatch = useDispatch();
  const date = capitalizeFirstLetter(getCohortPeriod(getCohort(young.cohort)));
  const [loading, setLoading] = useState(false);

  const handleChangeCohort = async () => {
    const cohort = "à venir";
    setLoading(true);
    try {
      const { ok, data, code } = await changeYoungCohort({ youngId: young._id, reason, message, cohortName: cohort });
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
    <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr(e) de vouloir changer de séjour ?">
      <div className="grid gap-2 p-3 max-w-3xl mx-auto">
        <p className="text-center text-gray-500 p-3">En confirmant, vous vous désisterez du séjour sur lequel vous êtes déjà positionné.</p>
        <div className="grid gap-2 p-3">
          <div className="bg-gray-100 pt-1 pb-2.5 px-4 rounded-md text-center leading-loose">
            <HiOutlineXCircle className="text-red-600 h-5 w-5 inline-block stroke-2" />
            <p className="text-gray-500 text-sm">Ancien séjour</p>
            <p className="text-gray-900 font-medium">{date}</p>
          </div>
          <div className="bg-gray-100 pt-1 pb-2.5 px-4 rounded-md text-center leading-loose">
            <HiOutlineCheckCircle className="text-blue-600 h-6 w-6 inline-block stroke-2" />
            <p className="text-gray-500 text-sm">Nouveau séjour</p>
            <p className="text-gray-900 font-medium leading-normal">Être alerté(e) lors de l’ouverture des inscriptions pour les prochains séjours</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full p-3 grid gap-3 bg-gray-50 md:grid-cols-2">
        <button onClick={handleChangeCohort} disabled={loading} className="w-full text-sm bg-blue-600 text-white p-2 rounded-md disabled:bg-gray-500">
          {loading ? "Envoi des données..." : "Oui, confirmer ce choix"}
        </button>
        <button onClick={() => setOpen(false)} disabled={loading} className="w-full text-sm border bg-white text-gray-500 p-2 rounded-md">
          Non, annuler
        </button>
      </div>
    </FullscreenModal>
  );
}

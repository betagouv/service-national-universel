import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import ReasonForm from "../components/ReasonForm";
import { toastr } from "react-redux-toastr";
import FullscreenModal from "@/components/modals/FullscreenModal";
import Container from "@/components/layout/Container";
import { getCohortPeriod, translate } from "snu-lib";
import { changeYoungCohort } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";
import { capitalizeFirstLetter } from "@/scenes/inscription2023/steps/stepConfirm";
import { getCohort } from "@/utils/cohorts";

export default function NewChoicSejour() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const { young } = useAuth();
  const history = useHistory();
  const cohortId = queryParams.get("cohortid") || "";
  const newCohortPeriod = queryParams.get("period");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  const date = capitalizeFirstLetter(getCohortPeriod(getCohort(young.cohort)));

  const handleChangeCohort = async () => {
    try {
      const { ok, data, code } = await changeYoungCohort(young._id, { reason, message, cohortId });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      dispatch(setYoung(data));
      history.push("/");
    } catch (error) {
      console.error("Erreur lors du changement de cohorte :", error);
    }
  };
  return (
    <Container title={`Séjour ${newCohortPeriod}`} backlink="/changer-de-sejour/no-date">
      <CurrentSejourNotice />
      <p className="mt-4 mb-6 text-sm leading-5 text-gray-500 font-normal text-center">Pour quelle(s) raison(s) souhaitez-vous changer de séjour ?</p>
      <ReasonForm reason={reason} setReason={setReason} message={message} setMessage={setMessage} onSubmit={() => setOpen(true)} />
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir changer de séjour ?">
        <div className="grid gap-2 p-3">
          <div className="bg-gray-100 p-2 rounded-xl text-center">
            <HiOutlineXCircle className="text-red-600 h-6 w-6 inline-block" />
            <p className="text-gray-500 leading-6">Ancien séjour</p>
            <p className="text-gray-900 leading-6 font-medium">{date}</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-xl text-center">
            <HiOutlineCheckCircle className="text-blue-600 h-6 w-6 inline-block" />
            <p className="text-gray-500 leading-6">Nouveau séjour</p>
            <p className="text-gray-900 leading-6 font-medium">{capitalizeFirstLetter(newCohortPeriod)}</p>
            {/* TODO: call inscription goals */}
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

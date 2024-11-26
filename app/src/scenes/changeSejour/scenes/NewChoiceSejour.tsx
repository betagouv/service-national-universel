import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import ReasonForm from "../components/ReasonForm";
import { toastr } from "react-redux-toastr";
import FullscreenModal from "@/components/modals/FullscreenModal";
import Container from "@/components/layout/Container";
import { translate } from "snu-lib";
import { changeYoungCohort } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";

export default function NewChoicSejour() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const { young } = useAuth();
  const history = useHistory();
  const cohortId = queryParams.get("cohortid");
  const newCohortPeriod = queryParams.get("period");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  const handleChangeCohort = async () => {
    const cohort = null;
    try {
      const { ok, data, code } = await changeYoungCohort(young._id, { reason, message, cohortId, cohort });
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
      <hr />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Pour quelle(s) raison(s) souhaitez-vous changer de séjour ?</p>
      <ReasonForm reason={reason} setReason={setReason} message={message} setMessage={setMessage} onSubmit={() => setOpen(true)} />
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir changer de séjour ?">
        yo
      </FullscreenModal>
      <button onClick={handleChangeCohort}>Changer de séjour</button>
    </Container>
  );
}

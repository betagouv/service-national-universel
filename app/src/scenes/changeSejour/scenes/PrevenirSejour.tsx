import React, { useState } from "react";
import ReasonForm from "../components/ReasonForm";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import Container from "@/components/layout/Container";
import FullscreenModal from "@/components/modals/FullscreenModal";
import { translate } from "snu-lib";
import { changeYoungCohort } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";

export default function PrevenirSejour() {
  const dispatch = useDispatch();
  const { young } = useAuth();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  const handleChangeCohort = async () => {
    const cohortId = null;
    const cohort = "à venir";
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
    <Container title="M'alerter lors de l'ouverture des prochaines inscriptions" backlink="/changer-de-sejour/no-date">
      <CurrentSejourNotice />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Vous serez alerté(e) par e-mail lors de l'ouverture des futures inscriptions.</p>
      <ReasonForm reason={reason} setReason={setReason} message={message} setMessage={setMessage} onSubmit={() => setOpen(true)} />
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir changer de séjour ?">
        wesh
      </FullscreenModal>
    </Container>
  );
}

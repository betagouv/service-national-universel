import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import { withdrawYoungAccount } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import ReasonForm from "../components/ReasonForm";
import Container from "@/components/layout/Container";
import FullscreenModal from "@/components/modals/FullscreenModal";
import { translate } from "snu-lib";

export default function WithdrawSejour() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [open, setOpen] = useState(false);

  const handleWithdraw = async () => {
    try {
      const { ok, data, code } = await withdrawYoungAccount({ withdrawnMessage, withdrawnReason });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      dispatch(setYoung(data));
      history.push("/");
    } catch (error) {
      console.error("Erreur lors du désistement :", error);
    }
  };

  return (
    <Container title="Se désister" backlink="/changer-de-sejour/no-date">
      <CurrentSejourNotice />
      <hr />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Veuillez précisez la raison de votre désistement.</p>
      <ReasonForm
        reason={withdrawnReason}
        setReason={setWithdrawnReason}
        message={withdrawnMessage}
        setMessage={setWithdrawnMessage}
        onSubmit={() => setOpen(true)}
        text="Confirmer le désistement"
      />
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir vous désister ?">
        yo
      </FullscreenModal>
    </Container>
  );
}

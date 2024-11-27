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
  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Container title="Se désister" backlink="/changer-de-sejour/no-date">
      <CurrentSejourNotice />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Veuillez précisez la raison de votre désistement.</p>
      <ReasonForm
        reason={withdrawnReason}
        setReason={setWithdrawnReason}
        message={withdrawnMessage}
        setMessage={setWithdrawnMessage}
        onSubmit={() => setOpen(true)}
        text="Confirmer le désistement"
      />
      <Modal open={open} setOpen={setOpen} withdrawnReason={withdrawnReason} withdrawnMessage={withdrawnMessage} />
    </Container>
  );
}

function Modal({ open, setOpen, withdrawnReason, withdrawnMessage }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      const { ok, data, code } = await withdrawYoungAccount({ withdrawnMessage, withdrawnReason });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      dispatch(setYoung(data));
      setLoading(false);
      history.push("/");
    } catch (error) {
      setLoading(false);
      console.error("Erreur lors du désistement :", error);
    }
  };

  return (
    <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr(e) de vouloir vous désister du SNU ?">
      <p className="text-center text-sm text-gray-500 p-3">Si vous changez d'avis, vous pourrez vous positionner sur un nouveau séjour.</p>
      <div className="absolute bottom-0 w-full p-3 grid gap-3 bg-gray-50">
        <button onClick={handleWithdraw} disabled={loading} className="w-full text-sm bg-blue-600 text-white p-2 rounded-md disabled:bg-gray-400">
          {loading ? "Envoi des données..." : "Oui, confirmer mon désistement"}
        </button>
        <button onClick={() => setOpen(false)} disabled={loading} className="w-full text-sm border bg-white text-gray-500 p-2 rounded-md">
          Non, annuler
        </button>
      </div>
    </FullscreenModal>
  );
}

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { withdrawYoungAccount } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import ReasonForm from "../components/ReasonForm";
import ChangeSejourContainer from "../components/ChangeSejourContainer";
import FullscreenModal from "@/components/modals/FullscreenModal";
import { translate } from "snu-lib";

export default function WithdrawSejour() {
  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <ChangeSejourContainer title="Se désister" backlink="/changer-de-sejour/no-date">
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Veuillez précisez la raison de votre désistement.</p>
      <ReasonForm
        reason={withdrawnReason}
        setReason={setWithdrawnReason}
        message={withdrawnMessage}
        setMessage={setWithdrawnMessage}
        disabled={!withdrawnReason}
        onSubmit={() => setOpen(true)}
        text="Confirmer le désistement"
      />
      <Modal open={open} setOpen={setOpen} withdrawnReason={withdrawnReason} withdrawnMessage={withdrawnMessage} />
    </ChangeSejourContainer>
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
    <FullscreenModal
      isOpen={open}
      setOpen={setOpen}
      title="Êtes-vous sûr(e) de vouloir vous désister du SNU ?"
      onConfirm={handleWithdraw}
      loading={loading}
      confirmText="Oui, confirmer mon désistement"
      cancelText="Non, annuler">
      <p className="text-center text-sm text-gray-500 p-3">Si vous changez d'avis, vous pourrez vous positionner sur un nouveau séjour.</p>
    </FullscreenModal>
  );
}

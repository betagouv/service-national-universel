import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { withdrawYoungAccount, abandonYoungAccount } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import ReasonForm from "../components/ReasonForm";
import ChangeSejourContainer from "../components/ChangeSejourContainer";
import ResponsiveModal from "@/components/modals/ResponsiveModal";
import { translate } from "snu-lib";
import { useLocation } from "react-router-dom";
import useAuth from "@/services/useAuth";

export default function WithdrawSejour() {
  const abandonStatus = ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION"];
  const { young } = useAuth();
  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [open, setOpen] = useState(false);
  const location = useLocation<{ backlink?: string }>();
  const backlink = location.state?.backlink || "/changer-de-sejour/no-date";

  return (
    <ChangeSejourContainer title={!abandonStatus.includes(young.status) ? "Se désister" : "Abandonner mon inscription"} backlink={backlink}>
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">
        Veuillez précisez la raison de votre {!abandonStatus.includes(young.status) ? "désistement" : "abandon"}.
      </p>
      <ReasonForm
        reason={withdrawnReason}
        setReason={setWithdrawnReason}
        message={withdrawnMessage}
        setMessage={setWithdrawnMessage}
        disabled={!withdrawnReason || !withdrawnMessage}
        text={!abandonStatus.includes(young.status) ? "Confirmer le désistement" : "Confirmer votre abandon"}
        onSubmit={() => setOpen(true)}
      />
      <Modal open={open} setOpen={setOpen} withdrawnReason={withdrawnReason} withdrawnMessage={withdrawnMessage} />
    </ChangeSejourContainer>
  );
}

function Modal({ open, setOpen, withdrawnReason, withdrawnMessage }) {
  const abandonStatus = ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION"];
  const { young } = useAuth();
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (!abandonStatus.includes(young.status)) {
        const { ok, data, code } = await withdrawYoungAccount({ withdrawnMessage, withdrawnReason });
        if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
        dispatch(setYoung(data));
      } else {
        const { ok, data, code } = await abandonYoungAccount({ withdrawnMessage, withdrawnReason });
        if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
        dispatch(setYoung(data));
      }
      setLoading(false);
      history.push("/");
    } catch (error) {
      setLoading(false);
      console.error("Erreur lors du désistement :", error);
    }
  };

  return (
    <ResponsiveModal
      isOpen={open}
      setOpen={setOpen}
      title={!abandonStatus.includes(young.status) ? "Êtes-vous sûr(e) de vouloir vous désister du SNU ?" : "Êtes-vous sûr(e) de vouloir abandonner SNU ?"}
      onConfirm={handleConfirm}
      loading={loading}
      confirmText={!abandonStatus.includes(young.status) ? "Oui, confirmer mon désistement" : "Oui, confirmer mon abandon"}
      cancelText="Non, annuler">
      <p className="text-center text-sm text-gray-500 p-3">Si vous changez d'avis, vous pourrez vous positionner sur un nouveau séjour.</p>
    </ResponsiveModal>
  );
}

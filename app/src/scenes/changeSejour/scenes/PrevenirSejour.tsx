import React, { useState } from "react";
import ReasonForm from "../components/ReasonForm";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import ChangeSejourContainer from "../components/ChangeSejourContainer";
import ResponsiveModal from "@/components/modals/ResponsiveModal";
import { getCohortPeriod } from "snu-lib";
import useChangeSejour from "../lib/useChangeSejour";
import { getCohort } from "@/utils/cohorts";
import { capitalizeFirstLetter } from "@/scenes/inscription2023/steps/stepConfirm";
import { HiOutlineXCircle } from "react-icons/hi2";
import { HiOutlineCheckCircle } from "react-icons/hi2";

export default function PrevenirSejour() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  return (
    <ChangeSejourContainer title="Être alerté(e) pour les prochains séjours" backlink="/changer-de-sejour/">
      <p className="mt-4 mb-6 text-sm leading-5 text-gray-500 text-center font-normal">Vous serez alerté(e) par e-mail lors de l'ouverture des futures inscriptions.</p>
      <ReasonForm reason={reason} setReason={setReason} message={message} setMessage={setMessage} onSubmit={() => setOpen(true)} disabled={!reason} />
      <Modal open={open} setOpen={setOpen} reason={reason} message={message} />
    </ChangeSejourContainer>
  );
}

function Modal({ open, setOpen, reason, message }) {
  const { young } = useAuth();
  const history = useHistory();
  const date = capitalizeFirstLetter(getCohortPeriod(getCohort(young.cohort)));
  const { mutate, isPending: loading } = useChangeSejour();

  const handleChangeCohort = async () => {
    mutate(
      { reason, message, cohortName: "à venir" },
      {
        onSuccess: () => {
          setOpen(false);
          history.push("/");
        },
      },
    );
  };

  return (
    <ResponsiveModal
      isOpen={open}
      setOpen={setOpen}
      title="Êtes-vous sûr(e) de vouloir changer de séjour ?"
      onConfirm={handleChangeCohort}
      loading={loading}
      confirmText="Oui, confirmer ce choix"
      cancelText="Non, annuler">
      <div className="grid gap-2 p-3 max-w-xl mx-auto">
        <p className="text-center text-gray-500 p-3">En confirmant, vous vous désisterez du séjour sur lequel vous êtes déjà positionné.</p>
        <div className="grid gap-2 p-3">
          <div className="bg-gray-100 pt-1 pb-2.5 px-4 rounded-md text-center leading-loose">
            <HiOutlineXCircle className="text-red-600 h-5 w-5 inline-block stroke-2" />
            <p className="text-gray-500 text-sm">Ancien séjour</p>
            <p className="text-gray-900 font-medium">{date}</p>
          </div>
          <div className="bg-gray-100 pt-1 pb-2.5 px-4 rounded-md text-center leading-loose">
            <HiOutlineCheckCircle className="text-blue-600 h-5 w-5 inline-block stroke-2" />
            <p className="text-gray-500 text-sm">Nouveau séjour</p>
            <p className="text-gray-900 font-medium leading-normal">Être alerté(e) lors de l’ouverture des inscriptions pour les prochains séjours</p>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}

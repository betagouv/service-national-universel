import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import ReasonForm from "../components/ReasonForm";
import ResponsiveModal from "@/components/modals/ResponsiveModal";
import ChangeSejourContainer from "../components/ChangeSejourContainer";
import { getCohortPeriod } from "snu-lib";
import useChangeSejour from "../lib/useChangeSejour";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";
import { capitalizeFirstLetter } from "@/scenes/inscription2023/steps/stepConfirm";
import { getCohort } from "@/utils/cohorts";
import useInscriptionGoal from "../lib/useInscriptionGoal";
import Loader from "@/components/Loader";

export default function NewChoiceSejour() {
  const queryParams = new URLSearchParams(window.location.search);
  const newCohortPeriod = queryParams.get("period");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <ChangeSejourContainer title={`Séjour ${newCohortPeriod}`} backlink="/changer-de-sejour/">
      <p className="mt-4 mb-6 text-sm leading-5 text-gray-500 font-normal text-center">Pour quelle(s) raison(s) souhaitez-vous changer de séjour ?</p>
      <ReasonForm reason={reason} setReason={setReason} message={message} setMessage={setMessage} disabled={!reason} onSubmit={() => setOpen(true)} />
      <Modal open={open} setOpen={setOpen} newCohortPeriod={newCohortPeriod} reason={reason} message={message} />
    </ChangeSejourContainer>
  );
}

function Modal({ open, setOpen, newCohortPeriod, reason, message }) {
  const { young } = useAuth();
  const queryParams = new URLSearchParams(window.location.search);
  const cohortId = queryParams.get("cohortid") || "";
  const cohortName = queryParams.get("cohortName") || "";
  const oldCohortPeriod = capitalizeFirstLetter(getCohortPeriod(getCohort(young.cohort)));
  const history = useHistory();
  const sejourMutation = useChangeSejour();
  const goalQuery = useInscriptionGoal(cohortName);

  if (goalQuery.isPending) return <Loader />;
  if (goalQuery.isError) return <div>Erreur</div>;

  const handleChangeCohort = () => {
    sejourMutation.mutate(
      { reason, message, cohortId },
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
      loading={sejourMutation.isPending}
      confirmText="Oui, confirmer ce choix"
      cancelText="Non, annuler">
      <div className="grid gap-2 p-3 max-w-md mx-auto my-4">
        <div className="bg-gray-100 pt-1 pb-2.5 px-4 rounded-md text-center leading-loose">
          <HiOutlineXCircle className="text-red-600 h-5 w-5 inline-block stroke-2" />
          <p className="text-gray-500 text-sm">Ancien séjour</p>
          <p className="text-gray-900 font-medium">{oldCohortPeriod}</p>
        </div>
        <div className="bg-gray-100 pt-1 pb-2.5 px-4 rounded-md text-center leading-loose">
          <HiOutlineCheckCircle className="text-blue-600 h-5 w-5 inline-block stroke-2" />
          <p className="text-gray-500 text-sm">Nouveau séjour</p>
          <p className="text-gray-900 font-medium">{capitalizeFirstLetter(newCohortPeriod)}</p>
          {goalQuery.data ? (
            <>
              <hr className="my-3"></hr>
              <p className="text-sm leading-normal text-gray-500">
                Malheureusement il n'y a plus de place disponible actuellement pour ce séjour. <strong>Vous allez être positionné(e) sur liste complémentaire</strong> et vous serez
                averti(e) si des places se libèrent.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </ResponsiveModal>
  );
}

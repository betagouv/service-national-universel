import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import ReasonForm from "../components/ReasonForm";
import { toastr } from "react-redux-toastr";
import ResponsiveModal from "@/components/modals/ResponsiveModal";
import ChangeSejourContainer from "../components/ChangeSejourContainer";
import { getCohortPeriod, translate } from "snu-lib";
import { changeYoungCohort } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";
import { capitalizeFirstLetter } from "@/scenes/inscription2023/steps/stepConfirm";
import { getCohort } from "@/utils/cohorts";
import API from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export default function NewChoicSejour() {
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

async function getInscriptionGoalReachedNormalized({ department, cohortId }) {
  const { data, ok, code } = await API.get(`/inscription-goal/${encodeURIComponent(cohortId)}/department/${encodeURIComponent(department)}`);
  if (!ok) {
    toastr.error("Oups, une erreur s'est produite", translate(code));
    return null;
  }
  return data;
}

function useIsGoalReached(cohortId: string) {
  const { young } = useAuth();
  return useQuery({
    queryFn: () => getInscriptionGoalReachedNormalized({ department: young.department, cohortId }),
    queryKey: ["inscription-goal", young.department, cohortId],
  });
}

function Modal({ open, setOpen, newCohortPeriod, reason, message }) {
  const { young } = useAuth();
  const queryParams = new URLSearchParams(window.location.search);
  const cohortId = queryParams.get("cohortid") || "";
  const oldCohortPeriod = capitalizeFirstLetter(getCohortPeriod(getCohort(young.cohort)));
  const isFull = queryParams.get("isFull") === "true";
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { data, isLoading } = useIsGoalReached(cohortId);

  const handleChangeCohort = async () => {
    try {
      setLoading(true);
      const { ok, data, code } = await changeYoungCohort({ youngId: young._id, reason, message, cohortId });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      dispatch(setYoung(data));
      setLoading(false);
      history.push("/");
    } catch (error) {
      toastr.error("Une erreur est survenue lors du changement de cohorte.", "");
      setLoading(false);
    }
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
      <div className="grid gap-2 p-3 max-w-lg mx-auto">
        <div className="bg-gray-100 pt-1 pb-2.5 px-4 rounded-md text-center leading-loose">
          <HiOutlineXCircle className="text-red-600 h-5 w-5 inline-block stroke-2" />
          <p className="text-gray-500 text-sm">Ancien séjour</p>
          <p className="text-gray-900 font-medium">{oldCohortPeriod}</p>
        </div>
        <div className="bg-gray-100 pt-1 pb-2.5 px-4 rounded-md text-center leading-loose">
          <HiOutlineCheckCircle className="text-blue-600 h-5 w-5 inline-block stroke-2" />
          <p className="text-gray-500 text-sm">Nouveau séjour</p>
          <p className="text-gray-900 font-medium">{capitalizeFirstLetter(newCohortPeriod)}</p>
          {isFull ? (
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
      <div className="absolute bottom-2 w-full p-3 grid gap-3 bg-gray-50 md:grid-cols-2">
        <button onClick={handleChangeCohort} disabled={loading} className="w-full text-sm bg-blue-600 text-white p-2 rounded-md disabled:bg-gray-400">
          {loading ? "Envoi des données..." : "Oui, confirmer ce choix"}
        </button>
        <button onClick={() => setOpen(false)} disabled={loading} className="w-full text-sm border bg-white text-gray-500 p-2 rounded-md">
          Non, annuler
        </button>
      </div>
    </ResponsiveModal>
  );
}

import React, { useState } from "react";
import Download from "../../../assets/icons/Download";
import { PlainButton, BorderButton } from "../../phase0/components/Buttons";
import UploadedFileIcon from "../../../assets/icons/UploadedFileIcon";
import ModalTimeSchedule from "./modals/ModalTimeSchedule";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { ROLES } from "snu-lib/roles";
import { useSelector } from "react-redux";
import EmptyFileIcon from "../../../assets/icons/EmptyFileIcon";

export default function TimeSchedule({ session, setSession, className = "" }) {
  const params = new URLSearchParams(window.location.search);
  const [modalOpened, setModalOpened] = useState(params.get("timeschedule") === "true");
  const currentUser = useSelector((state) => state.Auth.user);
  const hasTimeSchedule = session.timeScheduleFiles && session.timeScheduleFiles.length > 0;

  async function sendReminder() {
    if (session.headCenterId) {
      try {
        const result = await api.post(`/session-phase1/${session._id}/time-schedule/send-reminder`, {});
        if (result.ok) {
          toastr.success("Le chef de centre a bien été relancé.");
        } else {
          toastr.error("Une erreur est survenue pendant l'envoi de la relance. Veuillez réessayer dans quelques instants.");
        }
      } catch (err) {
        capture(err);
        toastr.error("Une erreur est survenue pendant l'envoi de la relance. Veuillez réessayer dans quelques instants.");
      }
    } else {
      toastr.error("Aucun chef de centre n’est rattaché à ce séjour. Vous devez renseigner un chef de centre avant de le relancer");
    }
  }

  return (
    <div className={`items-center justify-center ${className}`}>
      <div className="flex items-center rounded-lg bg-gray-50 p-9">
        {hasTimeSchedule ? <UploadedFileIcon /> : <EmptyFileIcon />}
        <div className="grow-1 mx-7">
          <div className="text-sm font-bold text-[#242526]">
            Emploi du temps du séjour : <span className="font-normal">{hasTimeSchedule ? "Déposé" : "Non déposé"}</span>
          </div>
          <div className="flex gap-2">
            {!hasTimeSchedule && [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(currentUser.role) && (
              <BorderButton className="mt-3" onClick={sendReminder} mode={"blue"}>
                Relancer le chef de centre
              </BorderButton>
            )}
            <PlainButton className="mt-3" onClick={() => setModalOpened(true)}>
              <Download />
              &#xA0;{hasTimeSchedule ? "Télécharger le(s) document(s)" : "Téléverser"}
            </PlainButton>
          </div>
        </div>
      </div>
      {modalOpened && <ModalTimeSchedule session={session} setSession={setSession} onCancel={() => setModalOpened(false)} />}
    </div>
  );
}
